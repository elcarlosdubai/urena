const nodemailer = require('nodemailer');

// Logo oficial Ureña Tax & Accounting en Base64 para adjunto RFC 2392 CID Inline (Compatible 100% con Gmail, Outlook, Apple Mail)
const LOGO_BASE64 = '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';

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { formType, name, phone, email, service, date, time, message, notes } = req.body || {};

  // Configuración SMTP Oficial Ureña Tax (premium45.web-hosting.com:465)
  const transporter = nodemailer.createTransport({
    host: 'premium45.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@urenatax.com',
      pass: '_rXT5yA;iX24o3uu'
    }
  });

  const logoAttachment = [{
    filename: 'logo.png',
    content: Buffer.from(LOGO_BASE64, 'base64'),
    cid: 'urena_logo'
  }];

  const promises = [];

  // =========================================================================
  // CASO 1: FORMULARIO DE RESERVA DE CITA (/cita/ o formulario con fecha)
  // =========================================================================
  if (formType === 'appointment' || date) {
    if (email && email.includes('@')) {
      const appointmentClientHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita | Ureña Tax</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F5F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F5F6; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                
                <!-- CABECERA VERDE CON LOGO OFICIAL -->
                <tr>
                  <td style="background-color: #28D070; padding: 30px 24px; text-align: center;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="background-color: #FFFFFF; padding: 10px 22px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                          <img src="cid:urena_logo" alt="Ureña Tax & Accounting" style="width: 190px; height: auto; display: block;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 6px 0 0; color: #000000; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">¡Tu Cita Ha Sido Registrada!</h1>
                    <p style="margin: 4px 0 0; color: rgba(0,0,0,0.8); font-size: 13px; font-weight: 600;">Cupón 10% OFF Aplicado • Paterson, New Jersey</p>
                  </td>
                </tr>

                <!-- CUERPO PRINCIPAL -->
                <tr>
                  <td style="padding: 28px 24px;">
                    <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: #1F2937;">
                      Hola <strong>${name || 'Estimado(a) Cliente'}</strong> 👋
                    </p>
                    <p style="font-size: 13px; color: #59595B; line-height: 1.5; margin-bottom: 22px;">
                      Tu solicitud de cita ha sido registrada exitosamente en <strong>Ureña Tax & Accounting Services</strong>. A continuación tienes los detalles de tu cita:
                    </p>

                    <!-- TARJETA DETALLES CITA -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                            📅 DATOS DE LA CITA AGENDADA
                          </div>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px;">
                            <tr style="border-bottom: 1px solid #E5E7EB;">
                              <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Servicio:</td>
                              <td style="padding: 8px 0; color: #111827; font-weight: 800; text-align: right;">${service || 'Asesoría Fiscal / Taxes'}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #E5E7EB;">
                              <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Fecha:</td>
                              <td style="padding: 8px 0; color: #047857; font-weight: 800; text-align: right;">${date || 'Por confirmar'}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #E5E7EB;">
                              <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Hora:</td>
                              <td style="padding: 8px 0; color: #047857; font-weight: 800; text-align: right;">${time || 'Por confirmar'}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #E5E7EB;">
                              <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Teléfono Registrado:</td>
                              <td style="padding: 8px 0; color: #111827; font-weight: 800; text-align: right;">${phone || 'No indicado'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Beneficio Postcard:</td>
                              <td style="padding: 8px 0; color: #28D070; font-weight: 900; text-align: right;">10% DE DESCUENTO ASEGURADO</td>
                            </tr>
                          </table>
                          ${notes ? `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #59595B;"><strong>Notas:</strong> ${notes}</div>` : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- BOTÓN WHATSAPP -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <a href="https://wa.me/15512321994?text=Hola%2C%20tengo%20una%20cita%20agendada%20para%20${encodeURIComponent(name || '')}" target="_blank" style="display: inline-block; background-color: #28D070; color: #000000; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(40,208,112,0.3);">
                            Confirmar o Modificar por WhatsApp ➔
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- OFICINA NEGRA -->
                    <div style="background-color: #000000; color: #FFFFFF; border-radius: 14px; padding: 18px; text-align: center; font-size: 12px; line-height: 1.5;">
                      <p style="margin: 0 0 4px; font-weight: 800; font-size: 13px; color: #FFFFFF;">📍 Oficina Principal Ureña Tax</p>
                      <p style="margin: 0 0 6px; color: #9CA3AF;">8 Clark St, Paterson, NJ 07505</p>
                      <p style="margin: 0;">Línea Directa / WhatsApp: <strong style="color: #28D070;">(551) 232-1994</strong></p>
                    </div>
                  </td>
                </tr>

                <!-- FOOTER LEGAL -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 18px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; line-height: 1.5;">
                    © 2026 Urena Tax & Accounting Solutions LLC • Paterson, NJ<br>
                    IRS Certified Acceptance Agent (CAA) • Servicios Contables y Tributarios Certificados
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

      promises.push(
        transporter.sendMail({
          from: '"Ureña Tax & Accounting" <info@urenatax.com>',
          to: email,
          subject: '🗓️ Confirmación de Cita (10% Descuento) - Ureña Tax & Accounting',
          html: appointmentClientHtml,
          attachments: logoAttachment
        })
      );
    }

    // Alerta Cita a la Oficina
    const appointmentAdminHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1F2937; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; max-width: 550px;">
        <h2 style="color: #28D070; margin-top: 0;">📅 Nueva Cita Agendada (Postcard 10% OFF)</h2>
        <p style="font-size: 13px; color: #6B7280;">Origen: Formulario Interactivo /cita/</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
        <p><strong>Cliente:</strong> ${name || 'No indicado'}</p>
        <p><strong>Teléfono:</strong> <a href="tel:${phone}">${phone || 'No indicado'}</a></p>
        <p><strong>Correo:</strong> <a href="mailto:${email}">${email || 'No indicado'}</a></p>
        <p><strong>Servicio:</strong> ${service || 'No especificado'}</p>
        <p><strong>Fecha Solicitada:</strong> <strong style="color: #047857;">${date || 'No especificada'}</strong></p>
        <p><strong>Hora Solicitada:</strong> <strong style="color: #047857;">${time || 'No especificada'}</strong></p>
        ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
        <a href="https://wa.me/${(phone || '').replace(/\D/g, '')}" style="display: inline-block; background: #28D070; color: #000; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Contactar por WhatsApp al Cliente ➔</a>
      </div>`;

    promises.push(
      transporter.sendMail({
        from: '"Alerta Cita Ureña" <info@urenatax.com>',
        to: 'carlosbaezrd@gmail.com',
        subject: `📅 Nueva Cita Agendada: ${name || 'Cliente'} (${date || ''} ${time || ''})`,
        html: appointmentAdminHtml
      })
    );
  }
  // =========================================================================
  // CASO 2: FORMULARIO DE CONTACTO GENERAL WEB (/contact)
  // =========================================================================
  else {
    if (email && email.includes('@')) {
      const clientContactHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje Recibido | Ureña Tax & Accounting</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F5F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F5F6; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                
                <!-- CABECERA VERDE CON LOGO OFICIAL -->
                <tr>
                  <td style="background-color: #28D070; padding: 30px 24px; text-align: center;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="background-color: #FFFFFF; padding: 10px 22px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                          <img src="cid:urena_logo" alt="Ureña Tax & Accounting" style="width: 190px; height: auto; display: block;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 6px 0 0; color: #000000; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">¡Hemos Recibido tu Consulta!</h1>
                    <p style="margin: 4px 0 0; color: rgba(0,0,0,0.8); font-size: 13px; font-weight: 600;">Atención al Cliente • Paterson, New Jersey</p>
                  </td>
                </tr>

                <!-- CUERPO PRINCIPAL -->
                <tr>
                  <td style="padding: 28px 24px;">
                    <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: #1F2937;">
                      Hola <strong>${name || 'Estimado(a) Cliente'}</strong> 👋
                    </p>
                    <p style="font-size: 13px; color: #59595B; line-height: 1.5; margin-bottom: 22px;">
                      Gracias por ponerte en contacto con <strong>Ureña Tax & Accounting Services</strong>. Tu solicitud ha entrado satisfactoriamente en nuestra mesa de trabajo.
                    </p>

                    <!-- DASHBOARD PROGRESO 50% -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                            <tr>
                              <td align="left">
                                <span style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">ESTADO DE LA SOLICITUD</span>
                                <div style="font-size: 15px; font-weight: 900; color: #1F2937; margin-top: 2px;">En Cola de Asignación</div>
                              </td>
                              <td align="right" valign="middle">
                                <span style="background-color: #ECFDF5; color: #047857; font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 20px; border: 1px solid #A7F3D0;">50% PROCESADO</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden; margin-bottom: 12px;">
                            <tr>
                              <td width="50%" style="background-color: #28D070; height: 10px; border-radius: 10px;"></td>
                              <td width="50%" style="height: 10px;"></td>
                            </tr>
                          </table>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 11px; color: #6B7280;">
                            <tr>
                              <td width="33%" align="left" style="color: #047857; font-weight: bold;">✓ 1. Recibido</td>
                              <td width="34%" align="center" style="color: #1F2937; font-weight: bold;">⚡ 2. Revisión Asesor (Actual)</td>
                              <td width="33%" align="right" style="color: #9CA3AF;">○ 3. Contacto / Solución</td>
                            </tr>
                          </table>

                          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #59595B;">
                            ⏱ <strong>Tiempo de respuesta estimado:</strong> Menos de 24 horas hábiles.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- DETALLES CONSULTA -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Remitente:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">${name || 'No indicado'}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Correo Registrado:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Canal de Atención:</td>
                        <td style="padding: 10px 0; color: #047857; font-weight: 800; text-align: right;">Email & WhatsApp Directo</td>
                      </tr>
                    </table>

                    <!-- MENSAJE -->
                    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
                      <span style="color: #6B7280; font-size: 11px; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">Mensaje Enviado:</span>
                      <p style="margin: 0; font-size: 13px; color: #1F2937; font-style: italic; line-height: 1.4;">
                        "${message || 'Sin mensaje adicional'}"
                      </p>
                    </div>

                    <!-- BOTÓN WHATSAPP -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <a href="https://wa.me/15512321994" target="_blank" style="display: inline-block; background-color: #28D070; color: #000000; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(40,208,112,0.3);">
                            Hablar por WhatsApp con un Asesor ➔
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- OFICINA NEGRA -->
                    <div style="background-color: #000000; color: #FFFFFF; border-radius: 14px; padding: 18px; text-align: center; font-size: 12px; line-height: 1.5;">
                      <p style="margin: 0 0 4px; font-weight: 800; font-size: 13px; color: #FFFFFF;">📍 Oficina Principal Ureña Tax</p>
                      <p style="margin: 0 0 6px; color: #9CA3AF;">8 Clark St, Paterson, NJ 07505</p>
                      <p style="margin: 0;">Línea Directa / WhatsApp: <strong style="color: #28D070;">(551) 232-1994</strong></p>
                    </div>
                  </td>
                </tr>

                <!-- FOOTER LEGAL -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 18px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; line-height: 1.5;">
                    © 2026 Urena Tax & Accounting Solutions LLC • Paterson, NJ<br>
                    IRS Certified Acceptance Agent (CAA) • Servicios Contables y Tributarios Certificados
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

      promises.push(
        transporter.sendMail({
          from: '"Ureña Tax & Accounting" <info@urenatax.com>',
          to: email,
          subject: '✅ Consulta Recibida - Ureña Tax & Accounting Services',
          html: clientContactHtml,
          attachments: logoAttachment
        })
      );
    }

    // Alerta Contacto a la Oficina
    const adminContactHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1F2937; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; max-width: 550px;">
        <h2 style="color: #28D070; margin-top: 0;">📩 Nuevo Mensaje del Formulario Web</h2>
        <p style="font-size: 13px; color: #6B7280;">Origen: Formulario de Contacto Web</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
        <p><strong>Remitente:</strong> ${name || 'No indicado'}</p>
        <p><strong>Correo:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Mensaje:</strong></p>
        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB; font-style: italic;">"${message || 'Sin mensaje'}"</div>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
        <a href="mailto:${email}?subject=Respuesta%20Ureña%20Tax" style="display: inline-block; background: #28D070; color: #000; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Responder al Cliente por Correo ➔</a>
      </div>`;

    promises.push(
      transporter.sendMail({
        from: '"Alerta Web Ureña" <info@urenatax.com>',
        to: 'carlosbaezrd@gmail.com',
        subject: `📩 Nuevo Mensaje Web de: ${name || 'Usuario'}`,
        html: adminContactHtml
      })
    );
  }

  try {
    await Promise.all(promises);
    return res.status(200).json({ success: true, message: 'All notification emails sent successfully' });
  } catch (err) {
    console.error('Error in send-email API:', err);
    return res.status(500).json({ error: err.message });
  }
};
