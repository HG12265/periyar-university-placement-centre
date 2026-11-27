-- ============================================================================
-- PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Database Engine : MySQL 8.0+ / MariaDB 10.3+
-- Character Set   : utf8mb4 / utf8mb4_unicode_ci
-- Generated For   : cPanel phpMyAdmin / MySQL CLI Import
-- 
-- DEFAULT CREDENTIALS CREATED BY THIS SCRIPT:
--   Role     : UNIVERSITY_ADMIN
--   Email    : placement@periyaruniversity.ac.in
--   Password : admin@123
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Table structure for table `User`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NULL,
  `role` ENUM('STUDENT','COMPANY','UNIVERSITY_ADMIN','DEPARTMENT_COORDINATOR') NOT NULL,
  `status` ENUM('PENDING','ACTIVE','DISABLED') NOT NULL DEFAULT 'PENDING',
  `mustChangePassword` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  INDEX `User_role_status_idx` (`role`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table structure for table `Session`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `csrfToken` VARCHAR(100) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_tokenHash_key` (`tokenHash`),
  INDEX `Session_userId_expiresAt_idx` (`userId`,`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table structure for table `ActivationToken`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ActivationToken`;
CREATE TABLE `ActivationToken` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ActivationToken_tokenHash_key` (`tokenHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table structure for table `ResetToken`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ResetToken`;
CREATE TABLE `ResetToken` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ResetToken_tokenHash_key` (`tokenHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table structure for table `Department`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Department`;
CREATE TABLE `Department` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(20) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_name_key` (`name`),
  UNIQUE KEY `Department_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table structure for table `Programme`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Programme`;
CREATE TABLE `Programme` (
  `id` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(30) NULL,
  `level` VARCHAR(2) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Programme_departmentId_name_key` (`departmentId`,`name`),
  INDEX `Programme_departmentId_idx` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table structure for table `Coordinator`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Coordinator`;
CREATE TABLE `Coordinator` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coordinator_userId_key` (`userId`),
  INDEX `Coordinator_departmentId_idx` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table structure for table `Student`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Student`;
CREATE TABLE `Student` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `registrationNo` VARCHAR(50) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  `programmeId` VARCHAR(36) NOT NULL,
  `passingYear` INT NOT NULL,
  `level` VARCHAR(2) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `about` TEXT NULL,
  `photoFileId` VARCHAR(36) NULL,
  `linkedin` VARCHAR(500) NULL,
  `github` VARCHAR(500) NULL,
  `portfolio` VARCHAR(500) NULL,
  `twitter` VARCHAR(500) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Student_userId_key` (`userId`),
  UNIQUE KEY `Student_registrationNo_key` (`registrationNo`),
  INDEX `Student_departmentId_programmeId_passingYear_idx` (`departmentId`,`programmeId`,`passingYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table structure for table `Education`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Education`;
CREATE TABLE `Education` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `qualification` VARCHAR(100) NOT NULL,
  `institution` VARCHAR(191) NOT NULL,
  `board` VARCHAR(191) NOT NULL,
  `passingYear` INT NOT NULL,
  `score` DECIMAL(5, 2) NOT NULL,
  `scale` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table structure for table `StudentSkill`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `StudentSkill`;
CREATE TABLE `StudentSkill` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudentSkill_studentId_name_key` (`studentId`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Table structure for table `StudentProject`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `StudentProject`;
CREATE TABLE `StudentProject` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `technologies` VARCHAR(500) NOT NULL,
  `github` VARCHAR(500) NULL,
  `liveUrl` VARCHAR(500) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Table structure for table `Internship`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Internship`;
CREATE TABLE `Internship` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `companyName` VARCHAR(191) NOT NULL,
  `domain` VARCHAR(191) NOT NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Table structure for table `Certificate`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Certificate`;
CREATE TABLE `Certificate` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `issuer` VARCHAR(191) NOT NULL,
  `year` INT NOT NULL,
  `fileId` VARCHAR(36) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. Table structure for table `Resume`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Resume`;
CREATE TABLE `Resume` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `fileId` VARCHAR(36) NOT NULL,
  `isPrimary` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Resume_fileId_key` (`fileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. Table structure for table `Company`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Company`;
CREATE TABLE `Company` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `website` VARCHAR(500) NULL,
  `address` TEXT NULL,
  `industry` VARCHAR(191) NULL,
  `employeeSize` VARCHAR(100) NULL,
  `foundedYear` INT NULL,
  `description` TEXT NULL,
  `linkedin` VARCHAR(500) NULL,
  `twitter` VARCHAR(500) NULL,
  `logoFileId` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Company_userId_key` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. Table structure for table `Job`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Job`;
CREATE TABLE `Job` (
  `id` VARCHAR(36) NOT NULL,
  `companyId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `jobType` VARCHAR(40) NOT NULL,
  `salaryMin` DECIMAL(12, 2) NULL,
  `salaryMax` DECIMAL(12, 2) NULL,
  `salaryUnit` VARCHAR(30) NOT NULL DEFAULT 'LPA',
  `location` VARCHAR(191) NOT NULL,
  `workMode` VARCHAR(40) NOT NULL DEFAULT 'On-site',
  `deadline` DATETIME(3) NOT NULL,
  `skills` JSON NULL,
  `approval` ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` TEXT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `archived` TINYINT(1) NOT NULL DEFAULT 0,
  `reviewedBy` VARCHAR(36) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Job_approval_active_deadline_idx` (`approval`,`active`,`deadline`),
  INDEX `Job_companyId_archived_idx` (`companyId`,`archived`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. Table structure for table `JobDepartment`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `JobDepartment`;
CREATE TABLE `JobDepartment` (
  `jobId` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`jobId`,`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. Table structure for table `JobProgramme`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `JobProgramme`;
CREATE TABLE `JobProgramme` (
  `jobId` VARCHAR(36) NOT NULL,
  `programmeId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`jobId`,`programmeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. Table structure for table `JobYear`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `JobYear`;
CREATE TABLE `JobYear` (
  `jobId` VARCHAR(36) NOT NULL,
  `year` INT NOT NULL,
  PRIMARY KEY (`jobId`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 20. Table structure for table `Application`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Application`;
CREATE TABLE `Application` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `jobId` VARCHAR(36) NOT NULL,
  `status` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NOT NULL DEFAULT 'APPLIED',
  `coverLetter` TEXT NULL,
  `resumeFileId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `selectedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Application_studentId_jobId_key` (`studentId`,`jobId`),
  INDEX `Application_studentId_status_idx` (`studentId`,`status`),
  INDEX `Application_jobId_status_idx` (`jobId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 21. Table structure for table `ApplicationHistory`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ApplicationHistory`;
CREATE TABLE `ApplicationHistory` (
  `id` VARCHAR(36) NOT NULL,
  `applicationId` VARCHAR(36) NOT NULL,
  `fromStatus` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NULL,
  `toStatus` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NOT NULL,
  `actorUserId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` VARCHAR(500) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 22. Table structure for table `Announcement`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Announcement`;
CREATE TABLE `Announcement` (
  `id` VARCHAR(36) NOT NULL,
  `authorUserId` VARCHAR(36) NOT NULL,
  `audience` ENUM('COORDINATORS','DEPARTMENT_STUDENTS') NOT NULL,
  `departmentId` VARCHAR(36) NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Announcement_audience_departmentId_published_idx` (`audience`,`departmentId`,`published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 23. Table structure for table `AnnouncementRead`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AnnouncementRead`;
CREATE TABLE `AnnouncementRead` (
  `announcementId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`announcementId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 24. Table structure for table `Notification`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Notification`;
CREATE TABLE `Notification` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Notification_userId_read_idx` (`userId`,`read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 25. Table structure for table `FileAsset`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `FileAsset`;
CREATE TABLE `FileAsset` (
  `id` VARCHAR(36) NOT NULL,
  `ownerType` VARCHAR(30) NOT NULL,
  `ownerId` VARCHAR(36) NOT NULL,
  `purpose` VARCHAR(40) NOT NULL,
  `originalName` VARCHAR(255) NOT NULL,
  `diskPath` VARCHAR(500) NOT NULL,
  `mimeType` VARCHAR(120) NOT NULL,
  `size` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `FileAsset_ownerType_ownerId_purpose_idx` (`ownerType`,`ownerId`,`purpose`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 26. Table structure for table `StudentImportBatch`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `StudentImportBatch`;
CREATE TABLE `StudentImportBatch` (
  `id` VARCHAR(36) NOT NULL,
  `coordinatorId` VARCHAR(36) NOT NULL,
  `stage` VARCHAR(20) NOT NULL DEFAULT 'PREVIEW',
  `payload` JSON NOT NULL,
  `validCount` INT NOT NULL DEFAULT 0,
  `errorCount` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `importedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 27. Table structure for table `AuditLog`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AuditLog`;
CREATE TABLE `AuditLog` (
  `id` VARCHAR(36) NOT NULL,
  `actorUserId` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(80) NOT NULL,
  `resourceId` VARCHAR(36) NULL,
  `details` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AuditLog_actorUserId_createdAt_idx` (`actorUserId`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ActivationToken` ADD CONSTRAINT `ActivationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ResetToken` ADD CONSTRAINT `ResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Programme` ADD CONSTRAINT `Programme_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Coordinator` ADD CONSTRAINT `Coordinator_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Coordinator` ADD CONSTRAINT `Coordinator_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Student` ADD CONSTRAINT `Student_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Student` ADD CONSTRAINT `Student_programmeId_fkey` FOREIGN KEY (`programmeId`) REFERENCES `Programme` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Education` ADD CONSTRAINT `Education_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentSkill` ADD CONSTRAINT `StudentSkill_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentProject` ADD CONSTRAINT `StudentProject_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Internship` ADD CONSTRAINT `Internship_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Resume` ADD CONSTRAINT `Resume_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Company` ADD CONSTRAINT `Company_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Job` ADD CONSTRAINT `Job_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `JobDepartment` ADD CONSTRAINT `JobDepartment_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `JobDepartment` ADD CONSTRAINT `JobDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `JobProgramme` ADD CONSTRAINT `JobProgramme_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `JobProgramme` ADD CONSTRAINT `JobProgramme_programmeId_fkey` FOREIGN KEY (`programmeId`) REFERENCES `Programme` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `JobYear` ADD CONSTRAINT `JobYear_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Application` ADD CONSTRAINT `Application_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Application` ADD CONSTRAINT `Application_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ApplicationHistory` ADD CONSTRAINT `ApplicationHistory_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AnnouncementRead` ADD CONSTRAINT `AnnouncementRead_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `Announcement` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AnnouncementRead` ADD CONSTRAINT `AnnouncementRead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentImportBatch` ADD CONSTRAINT `StudentImportBatch_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `Coordinator` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE Experience ADD CONSTRAINT Experience_studentId_fkey FOREIGN KEY (studentId) REFERENCES Student (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE AnnouncementDepartment ADD CONSTRAINT AnnouncementDepartment_announcementId_fkey FOREIGN KEY (nnouncementId) REFERENCES Announcement (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE AnnouncementDepartment ADD CONSTRAINT AnnouncementDepartment_departmentId_fkey FOREIGN KEY (departmentId) REFERENCES Department (id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- 1. University Administrator Account
-- Email    : placement@periyaruniversity.ac.in
-- Password : admin@123
INSERT INTO `User` (`id`, `email`, `fullName`, `passwordHash`, `role`, `status`, `mustChangePassword`, `createdAt`, `updatedAt`)
VALUES (
  'usr_admin_pu_001',
  'placement@periyaruniversity.ac.in',
  'University Placement Administrator',
  '$2b$12$kNYVY9Xi2PyyZE2ZNnkG2eMl7MJUfkDjE0Ds2N1yqypPY0WzOeJF6',
  'UNIVERSITY_ADMIN',
  'ACTIVE',
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  `passwordHash` = VALUES(`passwordHash`),
  `role` = 'UNIVERSITY_ADMIN',
  `status` = 'ACTIVE';

-- 2. Official Academic Departments of Periyar University
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
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Academic Programmes Under Departments
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
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
