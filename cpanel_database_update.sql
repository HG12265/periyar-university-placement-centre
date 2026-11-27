-- ============================================================================
-- PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - CPANEL DATABASE MIGRATION
-- ============================================================================
-- Run this SQL in cPanel phpMyAdmin on your existing placement database:
-- (e.g. cpaneluser_placement OR periyaruni_placement_centre)
--
-- This script safely updates:
--   1. Announcement audience enum + PDF/Image attachments
--   2. AnnouncementDepartment table (Target specific departments)
--   3. StudentProject technologies column (optional default '')
--   4. Experience table (Student Work Experience CRUD)
--   5. Company contact details (contactName, contactPhone, contactEmail, contactDesignation)
--   6. Job attachment columns (attachmentFileId, attachmentName, attachmentMime)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Upgrade Announcement Table (Expand Audience & Add Attachments)
ALTER TABLE `Announcement`
  MODIFY COLUMN `audience` ENUM('COORDINATORS', 'DEPARTMENT_STUDENTS', 'STUDENTS', 'BOTH') NOT NULL,
  ADD COLUMN `attachmentFileId` VARCHAR(36) NULL AFTER `published`,
  ADD COLUMN `attachmentName` VARCHAR(255) NULL AFTER `attachmentFileId`,
  ADD COLUMN `attachmentMime` VARCHAR(120) NULL AFTER `attachmentName`;

-- 2. Create AnnouncementDepartment Table
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

-- 3. Make StudentProject technologies optional
ALTER TABLE `StudentProject`
  MODIFY COLUMN `technologies` VARCHAR(500) NOT NULL DEFAULT '';

-- 4. Create Student Work Experience Table
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

-- 5. Add Company Corporate Contact Details
ALTER TABLE `Company`
  ADD COLUMN `contactName` VARCHAR(191) NULL AFTER `twitter`,
  ADD COLUMN `contactPhone` VARCHAR(30) NULL AFTER `contactName`,
  ADD COLUMN `contactEmail` VARCHAR(191) NULL AFTER `contactPhone`,
  ADD COLUMN `contactDesignation` VARCHAR(191) NULL AFTER `contactEmail`;

-- 6. Add Job Recruitment Flyer / JD Attachment Columns
ALTER TABLE `Job`
  ADD COLUMN `attachmentFileId` VARCHAR(36) NULL AFTER `skills`,
  ADD COLUMN `attachmentName` VARCHAR(255) NULL AFTER `attachmentFileId`,
  ADD COLUMN `attachmentMime` VARCHAR(120) NULL AFTER `attachmentName`;

SET FOREIGN_KEY_CHECKS = 1;
