import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { sendEmail } from '../services/emailService.js';

function createAccessToken(user) {
  const payload = { sub: user.id, email: user.email };
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '15m';
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn });
}

function createRefreshToken(user) {
  // Use random opaque token, store hashed in DB
  const token = crypto.randomBytes(48).toString('hex');
  return token;
}

async function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authController = {
  async register(req, res) {
    const { email, password, fullName } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await query(
      `INSERT INTO users (id, email, password_hash, full_name, is_email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, email, passwordHash, fullName, process.env.REQUIRE_EMAIL_VERIFICATION === 'true' ? false : true]
    );

    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = await hashToken(token);
      await query(
        `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours', NOW())`,
        [uuidv4(), userId, tokenHash]
      );

      const verifyLink = `https://app.nutriscan.vn/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
      await sendEmail({
        to: email,
        subject: 'Verify your NutriScanVN account',
        html: `<p>Hi ${fullName},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyLink}">Verify Email</a></p>`
      });
    }

    return res.status(201).json({ message: 'Registration successful' });
  },

  async login(req, res) {
    const { email, password } = req.body;

    const userRes = await query('SELECT id, email, password_hash, is_email_verified FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = userRes.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.is_email_verified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    const accessToken = createAccessToken({ id: user.id, email: user.email });
    const refreshToken = createRefreshToken({ id: user.id, email: user.email });
    const refreshTokenHash = await hashToken(refreshToken);

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + $4::interval, NOW())`,
      [uuidv4(), user.id, refreshTokenHash, process.env.JWT_REFRESH_EXPIRES || '30 days']
    );

    return res.json({ accessToken, refreshToken, userId: user.id });
  },

  async refresh(req, res) {
    const { refreshToken } = req.body;
    const tokenHash = await hashToken(refreshToken);

    const rtRes = await query(
      `SELECT rt.id, u.id as user_id, u.email
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash]
    );

    if (rtRes.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const row = rtRes.rows[0];

    // Rotate: delete old and issue a new one
    await query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);

    const accessToken = createAccessToken({ id: row.user_id, email: row.email });
    const newRefreshToken = createRefreshToken({ id: row.user_id, email: row.email });
    const newRefreshTokenHash = await hashToken(newRefreshToken);
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + $4::interval, NOW())`,
      [uuidv4(), row.user_id, newRefreshTokenHash, process.env.JWT_REFRESH_EXPIRES || '30 days']
    );

    return res.json({ accessToken, refreshToken: newRefreshToken });
  },

  async forgotPassword(req, res) {
    const { email } = req.body;

    const userRes = await query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    const user = userRes.rows[0];

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hashToken(token);

    await query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour', NOW())`,
      [uuidv4(), user.id, tokenHash]
    );

    const resetLink = `https://app.nutriscan.vn/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Reset your NutriScanVN password',
      html: `<p>Hi ${user.full_name || ''},</p><p>Reset your password by clicking this link:</p><p><a href="${resetLink}">Reset Password</a></p>`
    });

    return res.json({ message: 'If the email exists, a reset link has been sent' });
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    const tokenHash = await hashToken(token);

    const prRes = await query(
      `SELECT prt.id, prt.user_id
       FROM password_reset_tokens prt
       WHERE prt.token_hash = $1 AND prt.expires_at > NOW()`,
      [tokenHash]
    );

    if (prRes.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const row = prRes.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, row.user_id]);
    await query('DELETE FROM password_reset_tokens WHERE id = $1', [row.id]);
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [row.user_id]);

    return res.json({ message: 'Password reset successful' });
  },

  async verifyEmail(req, res) {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ message: 'Missing token or email' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) return res.status(400).json({ message: 'Invalid email' });

    const userId = userRes.rows[0].id;

    const evRes = await query(
      `SELECT id FROM email_verification_tokens
       WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
      [userId, tokenHash]
    );

    if (evRes.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    await query('UPDATE users SET is_email_verified = true WHERE id = $1', [userId]);
    await query('DELETE FROM email_verification_tokens WHERE id = $1', [evRes.rows[0].id]);

    return res.json({ message: 'Email verified successfully' });
  }
};
