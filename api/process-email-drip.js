const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL || "https://iqnigpsrmfiiydxyietl.supabase.co";
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

  try {
    const campRes = await fetch(`${SUPABASE_URL}/rest/v1/email_campaigns?status=eq.En Progreso&select=*&limit=1`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
    });

    const campaigns = await campRes.json();
    if (!campaigns || campaigns.length === 0) {
      return res.status(200).json({ status: "idle", message: "No hay campañas activas en cola" });
    }

    const campaign = campaigns[0];

    // Lote seguro por goteo: 2 correos por minuto
    const queueRes = await fetch(`${SUPABASE_URL}/rest/v1/email_queue?campaign_id=eq.${campaign.id}&status=eq.Pendiente&select=*&limit=2`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
    });

    const pendingEmails = await queueRes.json();

    if (!pendingEmails || pendingEmails.length === 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/email_campaigns?id=eq.${campaign.id}`, {
        method: "PATCH",
        headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completado", updated_at: new Date().toISOString() })
      });
      return res.status(200).json({ status: "completed", message: "Campaña finalizada" });
    }

    // Configuración oficial Ureña Tax
    const transporter = nodemailer.createTransport({
      host: 'premium45.web-hosting.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@urenatax.com',
        pass: '_rXT5yA;iX24o3uu'
      }
    });

    let sentBatchCount = 0;

    for (const item of pendingEmails) {
      try {
        const personalizedBody = campaign.content
          .replace(/{nombre}/g, item.recipient_name || 'Estimado(a) Cliente')
          .replace(/{email}/g, item.recipient_email);

        await transporter.sendMail({
          from: '"Ureña Tax & Accounting" <info@urenatax.com>',
          to: item.recipient_email,
          subject: campaign.subject,
          text: personalizedBody,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #1F2937; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; max-width: 600px; margin: 0 auto;">
            <div style="background: #28D070; padding: 15px; text-align: center; font-weight: 900; font-size: 18px; color: #000; border-radius: 8px 8px 0 0;">
              Ureña Tax & Accounting Solutions
            </div>
            <div style="padding: 20px; line-height: 1.6; font-size: 14px; white-space: pre-line;">
              ${personalizedBody}
            </div>
            <div style="background: #F9FAFB; padding: 12px; font-size: 11px; text-align: center; color: #6B7280; border-top: 1px solid #E5E7EB;">
              8 Clark St, Paterson, NJ • Tel: (551) 232-1994
            </div>
          </div>`
        });

        await fetch(`${SUPABASE_URL}/rest/v1/email_queue?id=eq.${item.id}`, {
          method: "PATCH",
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Enviado", sent_at: new Date().toISOString() })
        });

        sentBatchCount++;
      } catch (err) {
        console.error("Error enviando correo a", item.recipient_email, err.message);
        await fetch(`${SUPABASE_URL}/rest/v1/email_queue?id=eq.${item.id}`, {
          method: "PATCH",
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Error", error_message: err.message })
        });
      }
    }

    const newSentCount = (campaign.sent_count || 0) + sentBatchCount;
    await fetch(`${SUPABASE_URL}/rest/v1/email_campaigns?id=eq.${campaign.id}`, {
      method: "PATCH",
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sent_count: newSentCount, updated_at: new Date().toISOString() })
    });

    return res.status(200).json({ status: "success", sentBatch: sentBatchCount, totalSent: newSentCount });
  } catch (error) {
    console.error("Worker Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
