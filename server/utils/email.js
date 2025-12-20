const nodemailer = require('nodemailer');

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host && !user) return null;

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  return cachedTransport;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransport();
  if (!transport) {
    console.warn('[email] SMTP not configured; skipping email.');
    return false;
  }

  const from = process.env.SMTP_FROM || 'no-reply@marketplace.local';

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return true;
}

module.exports = {
  sendEmail,
};
