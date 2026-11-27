/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - DATABASE SEEDER
 * ============================================================================
 * 
 * Seeds:
 * 1. Default University Administrator account
 *    Email    : placement@periyaruniversity.ac.in
 *    Password : admin@123
 * 2. Official Academic Departments of Periyar University
 * 3. Academic Programmes (MCA, M.Sc, MBA, M.Com, M.A)
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/core.js';

async function seed() {
  console.log('Seeding Periyar University Placement Portal database...');

  // 1. Seed University Placement Administrator
  const adminEmail = 'placement@periyaruniversity.ac.in';
  const adminPassword = 'admin@123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'UNIVERSITY_ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false
    },
    create: {
      email: adminEmail,
      fullName: 'University Placement Administrator',
      passwordHash,
      role: 'UNIVERSITY_ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });

  console.log(`✓ Admin user ready: ${admin.email}`);

  // 2. Seed Departments and Programmes
  const departments = [
    [
      'Computer Science',
      'CS',
      [
        ['Master of Computer Applications (MCA)', 'PG'],
        ['M.Sc Computer Science', 'PG'],
        ['M.Sc Data Science', 'PG']
      ]
    ],
    [
      'Management Studies (DOMS)',
      'DOMS',
      [['Master of Business Administration (MBA)', 'PG']]
    ],
    ['Commerce', 'COMM', [['M.Com', 'PG']]],
    ['Mathematics', 'MATH', [['M.Sc Mathematics', 'PG']]],
    ['Biotechnology', 'BIOTECH', [['M.Sc Biotechnology', 'PG']]],
    ['Physics', 'PHYS', [['M.Sc Physics', 'PG']]],
    ['Chemistry', 'CHEM', [['M.Sc Chemistry', 'PG']]],
    ['English', 'ENG', [['M.A. English', 'PG']]],
    ['Tamil', 'TAM', [['M.A. Tamil', 'PG']]]
  ];

  for (const [name, code, programmes] of departments) {
    const department = await db.department.upsert({
      where: { name },
      create: { name, code, active: true },
      update: { code, active: true }
    });

    for (const [programmeName, level] of programmes) {
      await db.programme.upsert({
        where: {
          departmentId_name: {
            departmentId: department.id,
            name: programmeName
          }
        },
        create: {
          departmentId: department.id,
          name: programmeName,
          level,
          active: true
        },
        update: {
          level,
          active: true
        }
      });
    }
  }

  console.log('✓ Academic departments and programmes seeded successfully.');
  console.log('------------------------------------------------------------');
  console.log('Admin Credentials:');
  console.log(`Email    : ${adminEmail}`);
  console.log(`Password : ${adminPassword}`);
  console.log('------------------------------------------------------------');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
