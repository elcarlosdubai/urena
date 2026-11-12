const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { formType, name, phone, email, service, date, time, message, notes } = req.body || {};

  // Configuración SMTP Oficial Ureña Tax (premium45.web-hosting.com)
  const transporter = nodemailer.createTransport({
    host: 'premium45.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@urenatax.com',
      pass: '_rXT5yA;iX24o3uu'
    }
  });

  const promises = [];

  // =========================================================================
  // CASO 1: FORMULARIO DE RESERVA DE CITAS (POSTCARD / CITA)
  // =========================================================================
  if (formType === 'appointment' || date) {
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
                          <img src="data:image/png;base64,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" alt="Ureña Tax & Accounting" style="width: 190px; height: auto; display: block;" />
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
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Área de Interés:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">Asesoría Contable / ITIN / Taxes</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Canal de Atención:</td>
                        <td style="padding: 10px 0; color: #047857; font-weight: 800; text-align: right;">Email & WhatsApp Directo</td>
                      </tr>
                    </table>

                    <!-- MENSAJE -->
                    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
                      <span style="color: #6B7280; font-size: 11px; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">Mensaje Enviado por el Cliente:</span>
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
          html: clientContactHtml
        })
      );
    }

    // Alerta a la Oficina
    const adminContactHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1F2937; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; max-width: 550px;">
        <h2 style="color: #28D070; margin-top: 0;">📩 Nuevo Mensaje del Formulario Web</h2>
        <p style="font-size: 13px; color: #6B7280;">Origen: Formulario de Contacto en Portada</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
        <p><strong>Remitente:</strong> ${name}</p>
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
        subject: `📩 Nuevo Mensaje Web de: ${name}`,
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
}
