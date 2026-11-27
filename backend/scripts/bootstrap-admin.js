/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - BOOTSTRAP ADMIN
 * ============================================================================
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/core.js';

const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'placement@periyaruniversity.ac.in').trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin@123';

try {
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`Account ${email} already exists. Updating password...`);
    await db.user.update({
      where: { email },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        role: 'UNIVERSITY_ADMIN',
        status: 'ACTIVE',
        mustChangePassword: false
      }
    });
    console.log(`Admin account ${email} updated successfully with password: ${password}`);
  } else {
    await db.user.create({
      data: {
        email,
        fullName: 'University Placement Administrator',
        role: 'UNIVERSITY_ADMIN',
        status: 'ACTIVE',
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: false
      }
    });
    console.log(`Admin account created: ${email} with password: ${password}`);
  }
} finally {
  await db.$disconnect();
}
