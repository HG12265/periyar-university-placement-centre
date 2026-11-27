import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/core.js';

async function clearAllStudents() {
  console.log('Starting student data cleanup...');

  // 1. Find all student IDs and User IDs
  const students = await db.student.findMany({
    select: { id: true, userId: true }
  });

  const studentIds = students.map(s => s.id);
  const userIds = students.map(s => s.userId);

  console.log(`Found ${students.length} student record(s) to remove.`);

  if (studentIds.length > 0) {
    // 2. Find applications to delete history
    const applications = await db.application.findMany({
      where: { studentId: { in: studentIds } },
      select: { id: true }
    });
    const appIds = applications.map(a => a.id);

    if (appIds.length > 0) {
      await db.applicationHistory.deleteMany({
        where: { applicationId: { in: appIds } }
      });
      await db.application.deleteMany({
        where: { id: { in: appIds } }
      });
      console.log(`Removed ${appIds.length} application(s) and their histories.`);
    }

    // 3. Delete portfolio / sub-records
    await db.education.deleteMany({ where: { studentId: { in: studentIds } } });
    await db.studentSkill.deleteMany({ where: { studentId: { in: studentIds } } });
    await db.studentProject.deleteMany({ where: { studentId: { in: studentIds } } });
    await db.internship.deleteMany({ where: { studentId: { in: studentIds } } });
    await db.certificate.deleteMany({ where: { studentId: { in: studentIds } } });
    await db.resume.deleteMany({ where: { studentId: { in: studentIds } } });

    // 4. Delete Student records
    await db.student.deleteMany({
      where: { id: { in: studentIds } }
    });
    console.log(`Removed ${studentIds.length} Student model record(s).`);

    // 5. Delete FileAsset records for students
    await db.fileAsset.deleteMany({
      where: {
        OR: [
          { ownerType: 'STUDENT' },
          { ownerId: { in: studentIds } }
        ]
      }
    });

    // 6. Delete Users
    await db.user.deleteMany({
      where: { id: { in: userIds } }
    });
    console.log(`Removed ${userIds.length} Student User account(s).`);
  }

  // 7. Remove any orphaned student users just in case
  const orphanUsers = await db.user.deleteMany({
    where: { role: 'STUDENT' }
  });
  if (orphanUsers.count > 0) {
    console.log(`Removed ${orphanUsers.count} orphaned STUDENT user(s).`);
  }

  // 8. Clear student import batches
  await db.studentImportBatch.deleteMany({});
  console.log('Cleared student import batches.');

  // 9. Clean physical upload files under backend/uploads/students
  const studentsUploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'students');
  if (fs.existsSync(studentsUploadDir)) {
    try {
      fs.rmSync(studentsUploadDir, { recursive: true, force: true });
      fs.mkdirSync(studentsUploadDir, { recursive: true });
      console.log('Cleaned student upload files from disk.');
    } catch (e) {
      console.warn('Could not clean student files directory:', e.message);
    }
  }

  console.log('All student data has been completely removed from the database and disk.');
}

clearAllStudents()
  .catch(err => {
    console.error('Error clearing student data:', err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

