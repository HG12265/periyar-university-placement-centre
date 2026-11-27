-- ============================================================================
-- PERIYAR UNIVERSITY PLACEMENT PORTAL - ANNOUNCEMENTS UPGRADE MIGRATION
-- Run this SQL in cPanel phpMyAdmin (Database: periyaruni_placement_centre)
-- ============================================================================

-- 1. Expand Announcement audience enum & add PDF/Image attachment metadata columns
ALTER TABLE `Announcement`
  MODIFY COLUMN `audience` ENUM('COORDINATORS', 'DEPARTMENT_STUDENTS', 'STUDENTS', 'BOTH') NOT NULL,
  ADD COLUMN `attachmentFileId` VARCHAR(36) NULL AFTER `published`,
  ADD COLUMN `attachmentName` VARCHAR(255) NULL AFTER `attachmentFileId`,
  ADD COLUMN `attachmentMime` VARCHAR(120) NULL AFTER `attachmentName`;

-- 2. Create AnnouncementDepartment table for targeting particular department(s)
CREATE TABLE IF NOT EXISTS `AnnouncementDepartment` (
  `announcementId` VARCHAR(36) NOT NULL,
  `departmentId` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`announcementId`, `departmentId`),
  INDEX `AnnouncementDepartment_departmentId_idx` (`departmentId`),
  CONSTRAINT `AnnouncementDepartment_announcementId_fkey`
    FOREIGN KEY (`announcementId`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AnnouncementDepartment_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Make StudentProject.technologies optional with empty string default
ALTER TABLE `StudentProject`
  MODIFY COLUMN `technologies` VARCHAR(500) NOT NULL DEFAULT '';

-- 4. Create Experience table for Student Work Experience portfolio section
CREATE TABLE IF NOT EXISTS `Experience` (
  `id` VARCHAR(36) NOT NULL,
  `studentId` VARCHAR(36) NOT NULL,
  `companyName` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `employmentType` VARCHAR(60) NULL,
  `location` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NULL,
  `currentlyWorking` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Experience_studentId_idx` (`studentId`),
  CONSTRAINT `Experience_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Add Company Contact Details columns to Company table
ALTER TABLE `Company`
  ADD COLUMN `contactName` VARCHAR(191) NULL AFTER `twitter`,
  ADD COLUMN `contactPhone` VARCHAR(30) NULL AFTER `contactName`,
  ADD COLUMN `contactEmail` VARCHAR(191) NULL AFTER `contactPhone`,
  ADD COLUMN `contactDesignation` VARCHAR(191) NULL AFTER `contactEmail`;
