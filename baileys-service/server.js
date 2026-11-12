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
async function sendWhatsAppMessage(phone, messageText) {
  if (connectionState !== 'open' || !sock) {
    throw new Error('El bot de WhatsApp no está conectado.');
  }
  const jid = formatWhatsAppJid(phone);
  return await sock.sendMessage(jid, { text: messageText });
}

// =========================================================================
// MOTOR DE COLA AUTOMÁTICO (PROCESADOR DE MENSAJES DE UREÑA TAX)
// =========================================================================
let isWorkerRunning = false;

async function processQueueOnce() {
  if (!supabase || connectionState !== 'open') return;

  try {
    // 1. Buscar mensajes pendientes en email_queue o message_queue con canal whatsapp
    const { data: pending, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'Pendiente')
      .limit(5);

    if (error || !pending || pending.length === 0) return;

    for (const item of pending) {
      if (item.phone || item.contact) {
        const dest = item.phone || item.contact;
        const msg = item.body || item.message;
        console.log(`[Baileys Worker] Despachando a ${dest}...`);

        try {
          await sendWhatsAppMessage(dest, msg);
          await supabase
            .from('email_queue')
            .update({ status: 'Enviado', updated_at: new Date().toISOString() })
            .eq('id', item.id);
          console.log(`[Baileys Worker] ✅ Enviado a ${dest}`);
        } catch (err) {
          console.error(`[Baileys Worker] ❌ Error enviando a ${dest}:`, err.message);
        }

        // Delay anti-ban entre mensajes (30 a 45 segundos)
        const delay = Math.floor(Math.random() * 15000) + 25000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  } catch (e) {
    console.warn('[Baileys Worker Error]:', e.message);
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

// Iniciar servidor y socket
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  UREÑA TAX - SERVICIO BAILEYS INICIADO EN PUERTO ${PORT}`);
  console.log(`  Endpoint Estado: http://localhost:${PORT}/status`);
  console.log(`=======================================================`);
  startBaileys();
});
