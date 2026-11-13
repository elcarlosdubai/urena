const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

if (!globalThis.WebSocket) {
  globalThis.WebSocket = require('ws');
}

const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');

// Supabase Client (si está configurado)
const supabaseUrl = process.env.SUPABASE_URL || 'https://nplfivubxrvjrvokfptb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Variables de Estado de la Conexión
let sock = null;
let qrCodeData = null;
let connectionState = 'connecting'; // 'connecting', 'open', 'close', 'qr_ready'
let connectedPhone = null;

// Inicializador de Baileys
async function startBaileys() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[Baileys] Usando WhatsApp Web v${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Urena Tax Portal', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionState = 'qr_ready';
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('[Baileys] Nuevo código QR generado. Escanéalo desde el portal o terminal.');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      connectionState = 'close';
      qrCodeData = null;
      connectedPhone = null;
      console.log(`[Baileys] Conexión cerrada. Razón: ${statusCode}. Reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startBaileys, 5000);
      } else {
        console.log('[Baileys] Sesión cerrada permanentemente. Limpiando credenciales...');
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        }
        setTimeout(startBaileys, 3000);
      }
    } else if (connection === 'open') {
      connectionState = 'open';
      qrCodeData = null;
      connectedPhone = sock.user?.id ? sock.user.id.split(':')[0] : '5512321994';
      console.log(`[Baileys] ¡WhatsApp CONECTADO exitosamente! Número: ${connectedPhone}`);
      startQueueWorker();
    }
  });
}

// Formateador de Teléfono Internacional (+1 para USA / Paterson)
function formatWhatsAppJid(phone) {
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    clean = '1' + clean; // Prefijo USA si vienen 10 dígitos
  }
  return `${clean}@s.whatsapp.net`;
}

// Función de Envío Directo
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Envío humanizado anti-detección de Meta:
// 1. Nunca envía en paralelo (cola secuencial)
// 2. Marca presencia "en línea" -> "escribiendo..." proporcional al texto -> "pausa" -> envía
async function sendWhatsAppMessage(phone, messageText) {
  if (connectionState !== 'open' || !sock) {
    throw new Error('WhatsApp no está conectado.');
  }
  const jid = formatWhatsAppJid(phone);

  try {
    await sock.sendPresenceUpdate('available', jid);
    await sleep(randomBetween(800, 1600));
    await sock.presenceSubscribe(jid).catch(() => {});
    await sock.sendPresenceUpdate('composing', jid);

    // Simular tiempo de escritura humano según longitud del mensaje (2.5s a 6.5s)
    const typingMs = Math.min(6500, Math.max(2500, (messageText || '').length * 38));
    await sleep(typingMs + randomBetween(300, 900));

    await sock.sendPresenceUpdate('paused', jid);
    await sleep(randomBetween(300, 700));
  } catch (_) {}

  return await sock.sendMessage(jid, { text: messageText });
}

// =========================================================================
// MOTOR DE COLA AUTOMÁTICO CON PROTECCIÓN ANTI-BANEO (GOTEO HUMANO)
// =========================================================================
let isWorkerRunning = false;
let isProcessingBatch = false; // Lock estricto: jamás envía 2 mensajes a la vez
let sentInCurrentBlock = 0;

function isSafeBusinessHourNY() {
  // Evita envíos masivos de madrugada (permite 8:00 AM - 9:00 PM hora New York)
  const nyHour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false
  }).format(new Date()));
  return nyHour >= 8 && nyHour < 21;
}

async function processQueueOnce() {
  if (!supabase || connectionState !== 'open' || isProcessingBatch) return;
  if (!isSafeBusinessHourNY()) return;

  isProcessingBatch = true;
  try {
    const { data: campaigns, error: campErr } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'WA En Progreso')
      .limit(1);

    if (campErr || !campaigns || campaigns.length === 0) return;
    const campaign = campaigns[0];

    const { data: pending, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('status', 'Pendiente')
      .limit(5);

    if (error) return;
    if (!pending || pending.length === 0) {
      await supabase
        .from('email_campaigns')
        .update({ status: 'Completado', updated_at: new Date().toISOString() })
        .eq('id', campaign.id);
      return;
    }

    let sentOk = Number(campaign.sent_count || 0);
    let failedCount = Number(campaign.failed_count || 0);

    for (const item of pending) {
      if (connectionState !== 'open') break;
      const rawDest = String(item.recipient_email || '').replace(/^wa:/i, '');
      const dest = rawDest.replace(/\D/g, '');
      const template = String(campaign.content || '');
      if (dest.length < 7 || !template.trim()) {
        await supabase
          .from('email_queue')
          .update({ status: 'Fallido', error_message: 'Número o mensaje inválido' })
          .eq('id', item.id);
        failedCount++;
        continue;
      }

      const msg = template
        .replace(/{nombre}/g, item.recipient_name || 'Estimado(a) Cliente')
        .replace(/{telefono}/g, dest);

      console.log(`[WhatsApp Goteo] Escribiendo a ${dest}...`);
      try {
        await sendWhatsAppMessage(dest, msg);
        await supabase
          .from('email_queue')
          .update({ status: 'Enviado', sent_at: new Date().toISOString() })
          .eq('id', item.id);
        sentOk++;
        sentInCurrentBlock++;
        console.log(`[WhatsApp Goteo] ✅ Enviado a ${dest} (Bloque: ${sentInCurrentBlock}/25)`);
      } catch (err) {
        console.error(`[WhatsApp Goteo] ❌ Error a ${dest}:`, err.message);
        await supabase
          .from('email_queue')
          .update({ status: 'Fallido', error_message: err.message })
          .eq('id', item.id);
        failedCount++;
      }

      await supabase
        .from('email_campaigns')
        .update({ sent_count: sentOk, failed_count: failedCount, updated_at: new Date().toISOString() })
        .eq('id', campaign.id);

      // Pausa larga de enfriamiento cada 25 mensajes (4 a 7 minutos)
      if (sentInCurrentBlock >= 25) {
        const coolDownMs = randomBetween(240000, 420000);
        console.log(`[WhatsApp Goteo] ☕ Pausa humana de enfriamiento (${Math.round(coolDownMs / 60000)} min)...`);
        sentInCurrentBlock = 0;
        await sleep(coolDownMs);
      } else {
        // Espera orgánica entre mensajes (28 a 55 segundos)
        await sleep(randomBetween(28000, 55000));
      }
    }
  } catch (e) {
    console.warn('[WhatsApp Goteo Error]:', e.message);
  } finally {
    isProcessingBatch = false;
  }
}

function startQueueWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  console.log('[Baileys Worker] Motor de cola iniciado (escuchando cada 30s)...');
  setInterval(processQueueOnce, 30000);
}

// =========================================================================
// ENDPOINTS DE API PARA EL PORTAL ADMINISTRATIVO (/admin)
// =========================================================================

// Estado del Bot y QR
app.get('/status', (req, res) => {
  res.json({
    status: connectionState,
    phone: connectedPhone,
    qr: qrCodeData,
    timestamp: new Date().toISOString()
  });
});

// Enviar Mensaje Individual
app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body || {};
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone y message son requeridos.' });
  }

  try {
    const result = await sendWhatsAppMessage(phone, message);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Desconectar Sesión (Logout)
app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }
    connectionState = 'close';
    qrCodeData = null;
    connectedPhone = null;
    setTimeout(startBaileys, 2000);
    return res.json({ success: true, message: 'Sesión cerrada. Escanea un nuevo QR.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// MOTOR DE GOTEO DE CORREOS (DISPARA CADA 60s HACIA VERCEL)
// =========================================================================
const EMAIL_DRIP_URL = process.env.EMAIL_DRIP_URL || 'https://www.urenatax.com/api/process-email-drip';
let isEmailDripTicking = false;

async function triggerEmailDripOnce() {
  if (isEmailDripTicking) return;
  isEmailDripTicking = true;
  try {
    const res = await fetch(EMAIL_DRIP_URL, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === 'success' || data.status === 'completed') {
        console.log('[Email Goteo]', data);
      }
    }
  } catch (e) {
    console.warn('[Email Goteo] Error llamando endpoint:', e.message);
  } finally {
    isEmailDripTicking = false;
  }
}

setInterval(triggerEmailDripOnce, 60000);

// Iniciar servidor y socket
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  UREÑA TAX - SERVICIO BAILEYS INICIADO EN PUERTO ${PORT}`);
  console.log(`  Endpoint Estado: http://localhost:${PORT}/status`);
  console.log(`=======================================================`);
  startBaileys();
});
