-- ============================================================================
-- PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL
-- CLEAN SLATE RESET SCRIPT (REMOVES ALL OLD TEST DATA EXCEPT ADMIN)
-- ============================================================================
-- Run this SQL in cPanel phpMyAdmin on your placement database:
-- (e.g. periyaruni_placement_centre OR cpaneluser_placement)
--
-- Uses DELETE FROM instead of TRUNCATE to avoid MySQL InnoDB Foreign Key 1701 error.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Remove All Job Applications & Candidate Status History
DELETE FROM `ApplicationHistory`;
DELETE FROM `Application`;

-- 2. Remove All Recruitment Jobs, Eligibility Targets & Drives
DELETE FROM `JobYear`;
DELETE FROM `JobDepartment`;
DELETE FROM `JobProgramme`;
DELETE FROM `Job`;

-- 3. Remove All Student Profiles, Portfolios & Uploaded Resumes
DELETE FROM `Education`;
DELETE FROM `StudentSkill`;
DELETE FROM `StudentProject`;
DELETE FROM `Internship`;
DELETE FROM `Experience`;
DELETE FROM `Certificate`;
DELETE FROM `Resume`;
DELETE FROM `Student`;
DELETE FROM `StudentImportBatch`;

-- 4. Remove All Company Recruiter Profiles
DELETE FROM `Company`;

-- 5. Remove All Department Placement Coordinators
DELETE FROM `Coordinator`;

-- 6. Remove All Announcements, Target Links & Read Tracking
DELETE FROM `AnnouncementDepartment`;
DELETE FROM `AnnouncementRead`;
DELETE FROM `Announcement`;

-- 7. Remove All Old Sessions, Security Tokens, Notifications & File Records
DELETE FROM `Session`;
DELETE FROM `ActivationToken`;
DELETE FROM `ResetToken`;
DELETE FROM `Notification`;
DELETE FROM `FileAsset`;
DELETE FROM `AuditLog`;

-- 8. Delete All Users EXCEPT the Placement Administrator
DELETE FROM `User` WHERE `role` != 'UNIVERSITY_ADMIN';

-- 9. Ensure University Placement Administrator is Active
INSERT INTO `User` (`id`, `email`, `fullName`, `passwordHash`, `role`, `status`, `mustChangePassword`, `createdAt`, `updatedAt`)
VALUES (
  'usr_admin_pu_001',
  'placement@periyaruniversity.ac.in',
  'Placement Administrator',
  '$2b$12$kNYVY9Xi2PyyZE2ZNnkG2eMl7MJUfkDjE0Ds2N1yqypPY0WzOeJF6',
  'UNIVERSITY_ADMIN',
  'ACTIVE',
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  `fullName` = 'Placement Administrator',
  `passwordHash` = '$2b$12$kNYVY9Xi2PyyZE2ZNnkG2eMl7MJUfkDjE0Ds2N1yqypPY0WzOeJF6',
  `role` = 'UNIVERSITY_ADMIN',
  `status` = 'ACTIVE',
  `mustChangePassword` = 0;

-- 10. Ensure Official University Departments Are Preserved
INSERT INTO `Department` (`id`, `name`, `code`, `active`) VALUES
  ('dept_cs_001', 'Computer Science', 'CS', 1),
  ('dept_doms_002', 'Management Studies (DOMS)', 'DOMS', 1),
  ('dept_comm_003', 'Commerce', 'COMM', 1),
  ('dept_math_004', 'Mathematics', 'MATH', 1),
  ('dept_biotech_005', 'Biotechnology', 'BIOTECH', 1),
  ('dept_phys_006', 'Physics', 'PHYS', 1),
  ('dept_chem_007', 'Chemistry', 'CHEM', 1),
  ('dept_eng_008', 'English', 'ENG', 1),
  ('dept_tam_009', 'Tamil', 'TAM', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = 1;

-- 11. Ensure Official Academic Programmes Are Preserved
INSERT INTO `Programme` (`id`, `departmentId`, `name`, `code`, `level`, `active`) VALUES
  ('prog_mca_001', 'dept_cs_001', 'Master of Computer Applications (MCA)', 'MCA', 'PG', 1),
  ('prog_msc_cs_002', 'dept_cs_001', 'M.Sc Computer Science', 'MSC-CS', 'PG', 1),
  ('prog_msc_ds_003', 'dept_cs_001', 'M.Sc Data Science', 'MSC-DS', 'PG', 1),
  ('prog_mba_004', 'dept_doms_002', 'Master of Business Administration (MBA)', 'MBA', 'PG', 1),
  ('prog_mcom_005', 'dept_comm_003', 'M.Com', 'MCOM', 'PG', 1),
  ('prog_msc_math_006', 'dept_math_004', 'M.Sc Mathematics', 'MSC-MATH', 'PG', 1),
  ('prog_msc_biotech_007', 'dept_biotech_005', 'M.Sc Biotechnology', 'MSC-BIOTECH', 'PG', 1),
  ('prog_msc_phys_008', 'dept_phys_006', 'M.Sc Physics', 'MSC-PHYS', 'PG', 1),
  ('prog_msc_chem_009', 'dept_chem_007', 'M.Sc Chemistry', 'MSC-CHEM', 'PG', 1),
  ('prog_ma_eng_010', 'dept_eng_008', 'M.A. English', 'MA-ENG', 'PG', 1),
  ('prog_ma_tam_011', 'dept_tam_009', 'M.A. Tamil', 'MA-TAM', 'PG', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = 1;

SET FOREIGN_KEY_CHECKS = 1;
