import 'dotenv/config';
import { db } from '../src/lib/core.js';

async function fixForeignKeys() {
  console.log('Fixing Announcement foreign key in MySQL database...');
  try {
    // 1. Check if the foreign key exists and drop it
    try {
      await db.$executeRawUnsafe(`ALTER TABLE \`Announcement\` DROP FOREIGN KEY \`Announcement_departmentId_fkey\``);
      console.log('Dropped incorrect Announcement_departmentId_fkey.');
    } catch (e) {
      console.log('Note on dropping FK (may not exist or already dropped):', e.message);
    }

    // 2. Add the correct foreign key pointing to `Department` (not `Department?`)
    await db.$executeRawUnsafe(`
      ALTER TABLE \`Announcement\`
      ADD CONSTRAINT \`Announcement_departmentId_fkey\`
      FOREIGN KEY (\`departmentId\`) REFERENCES \`Department\` (\`id\`)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('Successfully added correct foreign key Announcement -> Department(id)!');
  } catch (err) {
    console.error('Error applying foreign key fix:', err);
    process.exitCode = 1;
  }
}

fixForeignKeys()
  .finally(() => db.$disconnect());

