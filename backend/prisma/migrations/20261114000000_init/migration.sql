-- Initial schema for Periyar University Placement Management Portal.

-- Equivalent column/table names to prisma/schema.prisma.

-- First-run on an empty MySQL 8+ database.

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `User` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NULL,
  `role` ENUM('STUDENT','COMPANY','UNIVERSITY_ADMIN','DEPARTMENT_COORDINATOR') NOT NULL,
  `status` ENUM('PENDING','ACTIVE','DISABLED') NOT NULL DEFAULT 'PENDING',
  `mustChangePassword` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  INDEX `User_role_status_idx` (`role`,`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ActivationToken` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ActivationToken_tokenHash_key` (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ResetToken` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ResetToken_tokenHash_key` (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Department` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(20) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_name_key` (`name`),
  UNIQUE KEY `Department_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Coordinator` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coordinator_userId_key` (`userId`),
  INDEX `Coordinator_departmentId_idx` (`departmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `StudentSkill` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudentSkill_studentId_name_key` (`studentId`,`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `StudentProject` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `technologies` VARCHAR(500) NOT NULL,
  `github` VARCHAR(500) NULL,
  `liveUrl` VARCHAR(500) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Internship` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `companyName` VARCHAR(191) NOT NULL,
  `domain` VARCHAR(191) NOT NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Certificate` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `issuer` VARCHAR(191) NOT NULL,
  `year` INT NOT NULL,
  `fileId` VARCHAR(36) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Resume` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `fileId` VARCHAR(36) NOT NULL,
  `isPrimary` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Resume_fileId_key` (`fileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Job_approval_active_deadline_idx` (`approval`,`active`,`deadline`),
  INDEX `Job_companyId_archived_idx` (`companyId`,`archived`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobDepartment` (
  `jobId` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`jobId`,`departmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobProgramme` (
  `jobId` VARCHAR(36) NOT NULL,
  `programmeId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`jobId`,`programmeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobYear` (
  `jobId` VARCHAR(36) NOT NULL,
  `year` INT NOT NULL,
  PRIMARY KEY (`jobId`,`year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Application` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `jobId` VARCHAR(36) NOT NULL,
  `status` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NOT NULL DEFAULT 'APPLIED',
  `coverLetter` TEXT NULL,
  `resumeFileId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `selectedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Application_studentId_jobId_key` (`studentId`,`jobId`),
  INDEX `Application_studentId_status_idx` (`studentId`,`status`),
  INDEX `Application_jobId_status_idx` (`jobId`,`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ApplicationHistory` (
  `id` VARCHAR(36) NOT NULL,
  `applicationId` VARCHAR(36) NOT NULL,
  `fromStatus` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NULL,
  `toStatus` ENUM('APPLIED','SHORTLISTED','SELECTED','REJECTED') NOT NULL,
  `actorUserId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` VARCHAR(500) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Announcement` (
  `id` VARCHAR(36) NOT NULL,
  `authorUserId` VARCHAR(36) NOT NULL,
  `audience` ENUM('COORDINATORS','DEPARTMENT_STUDENTS') NOT NULL,
  `departmentId` VARCHAR(36) NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Announcement_audience_departmentId_published_idx` (`audience`,`departmentId`,`published`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AnnouncementRead` (
  `announcementId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`announcementId`,`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Notification_userId_read_idx` (`userId`,`read`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

SET FOREIGN_KEY_CHECKS = 1;
