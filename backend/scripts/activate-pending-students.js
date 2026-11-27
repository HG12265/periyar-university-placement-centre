import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/core.js';

async function updatePendingStudents() {
  const students = await db.student.findMany({
    include: { user: true }
  });

  for (const s of students) {
    if (s.user.status === 'PENDING' || !s.user.passwordHash) {
      const passwordHash = await bcrypt.hash(s.registrationNo, 12);
      await db.user.update({
        where: { id: s.userId },
        data: {
          status: 'ACTIVE',
          passwordHash,
          mustChangePassword: true
        }
      });
      console.log(`Updated student ${s.user.fullName} (${s.registrationNo}): Status set to ACTIVE, initial password set to ${s.registrationNo}`);
    }
  }
}

updatePendingStudents()
  .catch(console.error)
  .finally(() => db.$disconnect());

