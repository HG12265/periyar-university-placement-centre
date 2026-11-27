/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - AUTHENTICATION ROUTES
 * ============================================================================
 * 
 * Provides endpoints for:
 * - POST /api/auth/login           - Email and password sign-in with rate limiting and CSRF issuance.
 * - GET  /api/auth/me              - Returns current session user and active CSRF token.
 * - POST /api/auth/logout          - Destroys active session cookie and DB record.
 * - POST /api/auth/change-password - Mandatory initial password change and credential update.
 * - POST /api/auth/activate        - Student self-activation via token and university registration number.
 * - POST /api/auth/forgot-password - Dispatches secure password reset link via Nodemailer SMTP.
 * - POST /api/auth/reset-password  - Verifies reset token and updates account credentials.
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import {
  db,
  asyncRoute,
  fail,
  sha256,
  secretToken,
  emailOf,
  required,
  publicUser,
  audit
} from '../lib/core.js';
import {
  cookieName,
  cookieOptions,
  sessionHours,
  requireAuth,
  csrf
} from '../middleware/auth.js';

const r = Router();

// Rate limiter for authentication endpoints: max 15 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' }
});

const duration = () => new Date(Date.now() + sessionHours() * 3600000);

const strongPassword = (p) => {
  if (typeof p !== 'string' || p.length < 6 || p.length > 128) {
    fail(400, 'Password must be at least 6 characters');
  }
  return p;
};

/**
 * Creates a fresh database session and returns the CSRF token while setting HTTP-only cookie.
 */
async function newSession(req, res, user) {
  if (req.cookies?.[cookieName]) {
    await db.session.deleteMany({
      where: { tokenHash: sha256(req.cookies[cookieName]) }
    });
  }

  const token = secretToken();
  const csrfToken = secretToken();

  await db.session.create({
    data: {
      userId: user.id,
      tokenHash: sha256(token),
      csrfToken,
      expiresAt: duration()
    }
  });

  res.cookie(cookieName, token, {
    ...cookieOptions,
    maxAge: sessionHours() * 3600000
  });

  return csrfToken;
}

/**
 * Sends transactional email via SMTP if configured in environment variables.
 * Uses IPv4 and strict timeouts to prevent hanging on Linux/cPanel shared servers.
 */
async function mail(to, subject, body, html = null) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const isGmail = process.env.SMTP_HOST.includes('gmail');
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    const trySend = async (transportConfig, label) => {
      const transport = nodemailer.createTransport(transportConfig);
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: body,
        html: html || undefined
      });
      console.log(`[Email Sent] Successfully delivered "${subject}" to ${to} (${label})`);
      return true;
    };

    try {
      // 1. Primary Attempt (with family: 4 to prevent hanging on Linux servers without IPv6 route)
      return await trySend({
        host: isGmail ? 'smtp.gmail.com' : process.env.SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        family: 4,               // Force IPv4
        connectionTimeout: 6000, // 6s connection timeout
        greetingTimeout: 6000,
        socketTimeout: 8000,
        tls: { rejectUnauthorized: false }
      }, `Primary ${port}`);
    } catch (err) {
      console.error(`[Email Error] Primary SMTP attempt failed for ${to}:`, err.message);

      // 2. Automatic Fallback: If port was 587 and failed (often blocked by cPanel hosting), try SSL port 465
      if (isGmail && port !== 465) {
        try {
          console.log(`[Email Retry] Attempting fallback to Gmail port 465 (SSL) for ${to}...`);
          return await trySend({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
            },
            family: 4,
            connectionTimeout: 6000,
            greetingTimeout: 6000,
            socketTimeout: 8000,
            tls: { rejectUnauthorized: false }
          }, 'Fallback 465');
        } catch (fallbackErr) {
          console.error(`[Email Error] Fallback port 465 also failed for ${to}:`, fallbackErr.message);
        }
      }
      return false;
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------------------
r.post(
  '/login',
  limiter,
  asyncRoute(async (req, res) => {
    const email = emailOf(req.body.email);
    const password = String(req.body.password || '');

    const user = await db.user.findUnique({
      where: { email },
      include: { student: true, company: true, coordinator: true }
    });

    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      fail(401, 'Incorrect email or password');
    }

    if (user.status !== 'ACTIVE') {
      fail(403, 'Account is not active. Contact university staff');
    }

    const csrfToken = await newSession(req, res, user);
    await audit(user.id, 'LOGIN', 'auth');

    res.json({
      user: publicUser(user),
      csrfToken
    });
  })
);

// ----------------------------------------------------------------------------
// GET /api/auth/me
// ----------------------------------------------------------------------------
r.get(
  '/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json({
      user: publicUser(req.user),
      csrfToken: req.session.csrfToken
    });
  })
);

// ----------------------------------------------------------------------------
// POST /api/auth/logout
// ----------------------------------------------------------------------------
r.post(
  '/logout',
  requireAuth,
  csrf,
  asyncRoute(async (req, res) => {
    await db.session.delete({ where: { id: req.session.id } });
    res.clearCookie(cookieName, cookieOptions);
    res.json({ message: 'Signed out' });
  })
);

// ----------------------------------------------------------------------------
// POST /api/auth/change-password
// ----------------------------------------------------------------------------
r.post(
  '/change-password',
  requireAuth,
  csrf,
  limiter,
  asyncRoute(async (req, res) => {
    const old = String(req.body.currentPassword || '');
    if (!req.user.passwordHash || !(await bcrypt.compare(old, req.user.passwordHash))) {
      fail(400, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(strongPassword(req.body.newPassword), 12);

    await db.$transaction([
      db.user.update({
        where: { id: req.user.id },
        data: { passwordHash, mustChangePassword: false }
      }),
      db.session.deleteMany({
        where: { userId: req.user.id, id: { not: req.session.id } }
      })
    ]);

    await audit(req.user.id, 'PASSWORD_CHANGED', 'auth');
    res.json({ message: 'Password changed' });
  })
);

// ----------------------------------------------------------------------------
// POST /api/auth/activate
// ----------------------------------------------------------------------------
r.post(
  '/activate',
  limiter,
  asyncRoute(async (req, res) => {
    const token = required(req.body.token, 'Activation code', 150);
    const reg = required(req.body.registrationNo, 'Registration number', 50);
    const email = emailOf(req.body.email);
    const passwordHash = await bcrypt.hash(strongPassword(req.body.password), 12);

    const activation = await db.activationToken.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: { include: { student: true } } }
    });

    if (
      !activation ||
      activation.usedAt ||
      activation.expiresAt < new Date() ||
      activation.user.email !== email ||
      activation.user.student?.registrationNo !== reg ||
      activation.user.status !== 'PENDING'
    ) {
      fail(400, 'Activation details are invalid or expired');
    }

    await db.$transaction(async (tx) => {
      const changed = await tx.activationToken.updateMany({
        where: { id: activation.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() }
      });
      if (changed.count !== 1) {
        fail(400, 'Activation already used');
      }
      await tx.user.update({
        where: { id: activation.userId },
        data: { passwordHash, status: 'ACTIVE' }
      });
    });

    res.json({ message: 'Account activated. You can now sign in' });
  })
);

// ----------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ----------------------------------------------------------------------------
r.post(
  '/forgot-password',
  limiter,
  asyncRoute(async (req, res) => {
    const email = emailOf(req.body.email);
    const user = await db.user.findUnique({ where: { email } });

    if (user && user.status === 'ACTIVE') {
      const token = secretToken();
      await db.resetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + 30 * 60000)
        }
      });

      const frontendBase = (process.env.FRONTEND_URL || 'https://periyaruniversity.ac.in').replace(/\/$/, '');
      const appPath = frontendBase.includes('/placement_centre')
        ? frontendBase
        : `${frontendBase}/placement_centre`;
      const resetUrl = `${appPath}/reset-password?token=${encodeURIComponent(token)}`;

      const textBody = `Hello ${user.fullName},\n\nYou requested a password reset for your Periyar University Placement Portal account.\n\nPlease open this link within 30 minutes to set a new password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

      const htmlBody = `<div style="font-family:sans-serif;max-width:540px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
          <h2 style="color:#122d46;margin-top:0;">Password Reset Request</h2>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">Hello <strong>${user.fullName}</strong>,</p>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">You recently requested to reset your password for the <strong>Periyar University Placement Portal</strong>. Click the button below to choose a new password. This link is valid for 30 minutes.</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}" style="background:#167d8d;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset My Password</a>
          </div>
          <p style="color:#718096;font-size:13px;line-height:1.5;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color:#167d8d;">${resetUrl}</a></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
          <p style="color:#a0aec0;font-size:12px;margin-bottom:0;">Periyar University · Centralized Placement Management Portal</p>
        </div>`;

      // Dispatch mail in background with error handling so the HTTP request responds immediately (<50ms)
      mail(email, 'Placement Portal Password Reset Link', textBody, htmlBody)
        .then((delivered) => {
          if (!delivered) {
            console.warn(`[Reset Link Fallback] Token for ${email}: ${resetUrl}`);
          }
        })
        .catch((err) => {
          console.error(`[Mail Dispatch Error] ${email}:`, err.message);
        });
    }

    res.json({
      message:
        'If the address exists, reset instructions will be sent. Please check your inbox (and spam folder)'
    });
  })
);

// ----------------------------------------------------------------------------
// POST /api/auth/reset-password
// ----------------------------------------------------------------------------
r.post(
  '/reset-password',
  limiter,
  asyncRoute(async (req, res) => {
    const token = required(req.body.token, 'Token', 150);
    const passwordHash = await bcrypt.hash(strongPassword(req.body.password), 12);

    const record = await db.resetToken.findUnique({
      where: { tokenHash: sha256(token) }
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      fail(400, 'Password reset link expired or invalid');
    }

    await db.$transaction(async (tx) => {
      const updated = await tx.resetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() }
      });
      if (updated.count !== 1) {
        fail(400, 'Reset link already used');
      }
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, mustChangePassword: false }
      });
      await tx.session.deleteMany({
        where: { userId: record.userId }
      });
    });

    res.json({ message: 'Password updated. Please sign in' });
  })
);

export default r;

/**
 * Generates an activation token for newly registered students.
 */
export const makeStudentActivation = async (userId, tx = db) => {
  const token = secretToken();
  await tx.activationToken.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 48 * 3600000)
    }
  });
  return token;
};

export { strongPassword, mail };
