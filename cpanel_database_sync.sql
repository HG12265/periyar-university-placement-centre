-- ============================================================================
-- PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - CPANEL DATABASE SYNC
-- ============================================================================
-- Run this in phpMyAdmin (Database: periyaruni_placement_centre)
-- This fixes the missing tables & columns that cause "Unexpected server error" (500)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create Experience Table (Required for Student Dashboard & Profile)
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

-- 2. Create AnnouncementDepartment Table (Required for Department-specific circulars)
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

-- 3. Add Company Corporate Contact Details (Required for Company Profile Edit & Save)
DROP PROCEDURE IF EXISTS AddCompanyContactCols;
DELIMITER $$
CREATE PROCEDURE AddCompanyContactCols()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Company' AND COLUMN_NAME = 'contactName') THEN
    ALTER TABLE `Company` ADD COLUMN `contactName` VARCHAR(191) NULL AFTER `twitter`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Company' AND COLUMN_NAME = 'contactPhone') THEN
    ALTER TABLE `Company` ADD COLUMN `contactPhone` VARCHAR(30) NULL AFTER `contactName`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Company' AND COLUMN_NAME = 'contactEmail') THEN
    ALTER TABLE `Company` ADD COLUMN `contactEmail` VARCHAR(191) NULL AFTER `contactPhone`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Company' AND COLUMN_NAME = 'contactDesignation') THEN
    ALTER TABLE `Company` ADD COLUMN `contactDesignation` VARCHAR(191) NULL AFTER `contactEmail`;
  END IF;
END$$
DELIMITER ;
CALL AddCompanyContactCols();
DROP PROCEDURE IF EXISTS AddCompanyContactCols;

-- 4. Add Job Attachment Columns (Flyer / JD Document)
DROP PROCEDURE IF EXISTS AddJobAttachmentCols;
DELIMITER $$
CREATE PROCEDURE AddJobAttachmentCols()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Job' AND COLUMN_NAME = 'attachmentFileId') THEN
    ALTER TABLE `Job` ADD COLUMN `attachmentFileId` VARCHAR(36) NULL AFTER `skills`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Job' AND COLUMN_NAME = 'attachmentName') THEN
    ALTER TABLE `Job` ADD COLUMN `attachmentName` VARCHAR(255) NULL AFTER `attachmentFileId`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Job' AND COLUMN_NAME = 'attachmentMime') THEN
    ALTER TABLE `Job` ADD COLUMN `attachmentMime` VARCHAR(120) NULL AFTER `attachmentName`;
  END IF;
END$$
DELIMITER ;
CALL AddJobAttachmentCols();
DROP PROCEDURE IF EXISTS AddJobAttachmentCols;

-- 5. Add Announcement Attachment Columns & Expand Audience Enum
DROP PROCEDURE IF EXISTS AddAnnouncementCols;
DELIMITER $$
CREATE PROCEDURE AddAnnouncementCols()
BEGIN
  ALTER TABLE `Announcement` MODIFY COLUMN `audience` ENUM('COORDINATORS', 'DEPARTMENT_STUDENTS', 'STUDENTS', 'BOTH') NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Announcement' AND COLUMN_NAME = 'attachmentFileId') THEN
    ALTER TABLE `Announcement` ADD COLUMN `attachmentFileId` VARCHAR(36) NULL AFTER `published`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Announcement' AND COLUMN_NAME = 'attachmentName') THEN
    ALTER TABLE `Announcement` ADD COLUMN `attachmentName` VARCHAR(255) NULL AFTER `attachmentFileId`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Announcement' AND COLUMN_NAME = 'attachmentMime') THEN
    ALTER TABLE `Announcement` ADD COLUMN `attachmentMime` VARCHAR(120) NULL AFTER `attachmentName`;
  END IF;
END$$
DELIMITER ;
CALL AddAnnouncementCols();
DROP PROCEDURE IF EXISTS AddAnnouncementCols;

-- 6. Make StudentProject technologies optional
ALTER TABLE `StudentProject` MODIFY COLUMN `technologies` VARCHAR(500) NOT NULL DEFAULT '';

SET FOREIGN_KEY_CHECKS = 1;
