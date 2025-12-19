  const bcrypt = require('bcrypt');
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  const nodemailer = require('nodemailer');
  const { OAuth2Client } = require('google-auth-library');
  const User = require('../models/User');

  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // POST /api/auth/register
  exports.register = async (req, res) => {
    try {
      const { name, email, password, isSeller } = req.body;
      if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email in use' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ name, email, passwordHash, isSeller: !!isSeller, authProvider: 'local' });
      await user.save();
      res.status(201).json({ id: user._id, email: user.email, name: user.name });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // POST /api/auth/login
  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      if (!user.passwordHash) {
        return res.status(400).json({ message: 'Use Google login for this account' });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, _id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // POST /api/auth/google
  exports.googleLogin = async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) return res.status(400).json({ message: 'Missing credential' });
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: 'Google login not configured' });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      let user = await User.findOne({ email: payload.email });
      let needsSave = false;

      if (!user) {
        user = new User({
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          passwordHash: undefined,
          isSeller: false,
          authProvider: 'google',
          googleId: payload.sub,
        });
        needsSave = true;
      } else {
        if (!user.googleId) {
          user.googleId = payload.sub;
          needsSave = true;
        }
        if (!user.authProvider) {
          user.authProvider = user.passwordHash ? 'local' : 'google';
          needsSave = true;
        }
      }

      if (needsSave) {
        user.updatedAt = new Date();
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, _id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // POST /api/auth/forgot-password
  exports.forgotPassword = async (req, res) => {
    try {
      console.log("SMTP_HOST =", process.env.SMTP_HOST);
      console.log("SMTP_PORT =", process.env.SMTP_PORT);
      console.log("SMTP_USER =", process.env.SMTP_USER);

      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });

      const user = await User.findOne({ email });
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

        user.resetToken = resetTokenHash;
        user.resetTokenExpires = expiresAt;
        await user.save();

        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const resetUrl = `${appBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });

        await transport.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@marketplace.local',
          to: email,
          subject: 'Reset your password',
          text: `You requested a password reset.\n\nReset link: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
              <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 12px; font-size: 20px;">Reset your password</h2>
                <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                  We received a request to reset your password. Use the button below to set a new password.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Reset password
                  </a>
                </div>
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                  This link expires in 30 minutes. If you did not request this, you can safely ignore this email.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
                  If the button doesn't work, paste this link into your browser: ${resetUrl}
                </p>
              </div>
            </div>
          `,
        });
      }

      res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // GET /api/auth/validate-reset-token
  exports.validateResetToken = async (req, res) => {
    try {
      const { email, token } = req.query;
      if (!email || !token) {
        return res.status(400).json({ message: 'Missing token or email' });
      }

      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        email,
        resetToken: resetTokenHash,
        resetTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.json({ valid: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // POST /api/auth/reset-password
  exports.resetPassword = async (req, res) => {
    try {
      const { email, token, password } = req.body;
      if (!email || !token || !password) {
        return res.status(400).json({ message: 'Missing fields' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password too short' });
      }

      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        email,
        resetToken: resetTokenHash,
        resetTokenExpires: { $gt: new Date() },
      });
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      user.updatedAt = new Date();
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
