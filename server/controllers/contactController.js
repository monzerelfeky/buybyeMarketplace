const { sendEmail } = require('../utils/email');

function resolveContactRecipient() {
  const from = process.env.SMTP_FROM || '';
  const match = from.match(/<([^>]+)>/);
  if (match && match[1]) return match[1];
  if (from && from.includes('@')) return from;
  return process.env.SMTP_USER || '';
}

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const recipient = resolveContactRecipient();
    if (!recipient) {
      return res.status(500).json({ message: 'Email destination not configured' });
    }

    const safeSubject = String(subject).trim();
    const text = `New contact message\n\nName: ${name}\nEmail: ${email}\nSubject: ${safeSubject}\n\n${message}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 12px; font-size: 18px;">New contact message</h2>
          <p style="margin: 0 0 6px; font-size: 14px; color: #374151;">
            <strong>Name:</strong> ${name}
          </p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #374151;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="margin: 0 0 6px; font-size: 14px; color: #374151;">
            <strong>Subject:</strong> ${safeSubject}
          </p>
          <p style="margin: 12px 0 0; font-size: 14px; color: #374151; white-space: pre-line;">
            ${message}
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: recipient,
      subject: `Contact form: ${safeSubject}`,
      text,
      html,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};
