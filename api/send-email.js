const nodemailer = require('nodemailer');

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
        <title>Confirmación de Cita | Ureña Tax & Accounting</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F4F5F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F5F6; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                
                <!-- CABECERA VERDE CON LOGO CORPORATIVO NATIVO -->
                <tr>
                  <td style="background-color: #28D070; padding: 30px 24px; text-align: center;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="background-color: #000000; padding: 10px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <span style="font-size: 20px; font-weight: 900; letter-spacing: 2.5px; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">UREÑA<span style="color: #28D070;">TAX</span></span>
                        </td>
                      </tr>
                    </table>
                    <div style="display: inline-block; background-color: #000000; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 6px;">
                      ★ Turno Confirmado
                    </div>
                    <h1 style="margin: 4px 0 0; color: #000000; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">¡Tu Cita Ha Sido Reservada!</h1>
                    <p style="margin: 4px 0 0; color: rgba(0,0,0,0.8); font-size: 13px; font-weight: 600;">Accounting • Business Tax • ITIN Specialist</p>
                  </td>
                </tr>

                <!-- CUERPO PRINCIPAL -->
                <tr>
                  <td style="padding: 28px 24px;">
                    <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: #1F2937;">
                      Hola <strong>${name || 'Estimado(a) Cliente'}</strong> 👋
                    </p>
                    <p style="font-size: 13px; color: #59595B; line-height: 1.5; margin-bottom: 20px;">
                      Hemos bloqueado tu turno en nuestro calendario para tu atención personalizada. A continuación encuentras el estado de tu reserva y tu beneficio exclusivo:
                    </p>

                    <!-- PANEL DASHBOARD CON BARRA DE PROGRESO 100% -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
                      <tr>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                            <tr>
                              <td align="left">
                                <span style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">ESTADO DE RESERVA</span>
                                <div style="font-size: 15px; font-weight: 900; color: #047857; margin-top: 2px;">✓ Cita 100% Confirmada</div>
                              </td>
                              <td align="right" valign="middle">
                                <span style="background-color: #ECFDF5; color: #047857; font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 20px; border: 1px solid #A7F3D0;">100% LISTO</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden; margin-bottom: 12px;">
                            <tr>
                              <td width="100%" style="background-color: #28D070; height: 10px; border-radius: 10px;"></td>
                            </tr>
                          </table>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 11px; color: #047857; font-weight: bold;">
                            <tr>
                              <td width="33%" align="left">✓ 1. Datos</td>
                              <td width="34%" align="center">✓ 2. Horario Bloqueado</td>
                              <td width="33%" align="right">✓ 3. Turno Asignado</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- BANNER DE DESCUENTO 10% -->
                    <div style="background-color: #ECFDF5; border: 2px dashed #28D070; border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 22px;">
                      <span style="display: block; color: #047857; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">★ BENEFICIO DE TEMPORADA APLICADO ★</span>
                      <div style="color: #065F46; font-size: 26px; font-weight: 900; margin: 4px 0;">10% DE DESCUENTO</div>
                      <p style="color: #4B5563; font-size: 12px; margin: 0;">Presenta este correo o menciónalo al momento de tu cita presencial o virtual.</p>
                    </div>

                    <!-- TABLA DETALLES DEL TURNO -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Servicio Requerido:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">${service || 'Declaración de Taxes'}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Fecha Reservada:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">${date || 'Por coordinar'}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Hora del Turno:</td>
                        <td style="padding: 10px 0; color: #047857; font-weight: 900; text-align: right;">${time || 'Por coordinar'}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Teléfono Registrado:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">${phone || 'No indicado'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Modalidad / Sede:</td>
                        <td style="padding: 10px 0; color: #111827; font-weight: 800; text-align: right;">8 Clark St, Paterson, NJ (o Virtual)</td>
                      </tr>
                    </table>

                    ${notes ? `
                    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 22px;">
                      <span style="color: #6B7280; font-size: 11px; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">Nota adicional proporcionada:</span>
                      <p style="margin: 0; font-size: 13px; color: #1F2937; font-style: italic;">"${notes}"</p>
                    </div>` : ''}

                    <!-- BOTÓN WHATSAPP DIRECTO -->
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
          html: appointmentClientHtml
        })
      );
    }

    // Alerta Cita a la Oficina Oficial (info@urenatax.com)
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
        to: 'info@urenatax.com',
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
                
                <!-- CABECERA VERDE CON LOGO CORPORATIVO NATIVO -->
                <tr>
                  <td style="background-color: #28D070; padding: 30px 24px; text-align: center;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="background-color: #000000; padding: 10px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <span style="font-size: 20px; font-weight: 900; letter-spacing: 2.5px; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">UREÑA<span style="color: #28D070;">TAX</span></span>
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
          html: clientContactHtml
        })
      );
    }

    // Alerta Contacto a la Oficina Oficial (info@urenatax.com)
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
        to: 'info@urenatax.com',
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
