-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 02, 2025 at 09:01 AM
-- Server version: 8.0.42-cll-lve
-- PHP Version: 8.3.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dskalmun_Rapp`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`dskalmun`@`localhost` PROCEDURE `update_database_structure` ()   BEGIN
    DECLARE needs_alter INT DEFAULT 0;
    DECLARE col_exists INT DEFAULT 0;
    DECLARE dbname VARCHAR(64);
    DECLARE tablename VARCHAR(64);
    DECLARE sql_query TEXT;
    
    SET dbname = DATABASE();
    SET tablename = 'departments';
    
    -- Check if dep_id has the right type
    SET @sql = CONCAT('SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ''', dbname, ''' 
        AND TABLE_NAME = ''', tablename, ''' 
        AND COLUMN_NAME = ''dep_id'' 
        AND DATA_TYPE = ''varchar'' 
        AND CHARACTER_MAXIMUM_LENGTH = 10');
    
    SET @sql_stmt = @sql;
    PREPARE stmt FROM @sql_stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT @col_exists INTO col_exists;
    
    IF col_exists = 0 THEN
        SET needs_alter = 1;
    END IF;
    
    -- Check if name column has the right type
    SET @sql = CONCAT('SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ''', dbname, ''' 
        AND TABLE_NAME = ''', tablename, ''' 
        AND COLUMN_NAME = ''name'' 
        AND DATA_TYPE = ''varchar'' 
        AND CHARACTER_MAXIMUM_LENGTH >= 100');
    
    SET @sql_stmt = @sql;
    PREPARE stmt FROM @sql_stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT @col_exists INTO col_exists;
    
    IF col_exists = 0 THEN
        SET needs_alter = 1;
    END IF;
    
    -- Apply changes if needed
    IF needs_alter = 1 THEN
        -- Create a temporary table with the correct structure
        SET @sql = CONCAT('CREATE TABLE IF NOT EXISTS ', tablename, '_new (
            dep_id VARCHAR(10) PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            status ENUM(''active'', ''inactive'') DEFAULT ''active''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Copy data from old table to new table if it exists
        IF EXISTS (SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = dbname AND TABLE_NAME = tablename) THEN
            -- Check if we're copying from old column names
            IF EXISTS (
                SELECT 1 FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = dbname 
                AND TABLE_NAME = tablename 
                AND COLUMN_NAME = 'department_id'
            ) THEN
                -- Copy from old column names
                SET @sql = CONCAT('INSERT IGNORE INTO ', tablename, '_new (dep_id, name, created_at, updated_at)
                    SELECT 
                        LPAD(department_id, 6, ''0'') as dep_id, 
                        department_name as name, 
                        COALESCE(created_at, NOW()) as created_at,
                        COALESCE(updated_at, NOW()) as updated_at
                    FROM ', tablename);
            ELSE
                -- Copy from current column names if they exist
                SET @sql = CONCAT('INSERT IGNORE INTO ', tablename, '_new (dep_id, name, created_at, updated_at)
                    SELECT 
                        COALESCE(dep_id, LPAD(CAST(ROW_NUMBER() OVER() AS CHAR), 6, ''0'')) as dep_id,
                        name,
                        COALESCE(created_at, NOW()) as created_at,
                        COALESCE(updated_at, NOW()) as updated_at
                    FROM ', tablename);
            END IF;
            
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            -- Rename tables
            SET @sql = CONCAT('RENAME TABLE ', tablename, ' TO ', tablename, '_old, ', 
                             tablename, '_new TO ', tablename, ';');
            
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            -- Drop old table
            SET @sql = CONCAT('DROP TABLE IF EXISTS ', tablename, '_old;');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            SELECT CONCAT('Updated table structure for ', tablename) AS message;
        ELSE
            -- Table didn't exist, just rename the new one
            SET @sql = CONCAT('RENAME TABLE ', tablename, '_new TO ', tablename, ';');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            SELECT CONCAT('Created new table: ', tablename) AS message;
        END IF;
    ELSE
        SELECT CONCAT('No changes needed for ', tablename) AS message;
    END IF;
    
    -- Continue with other tables...
    -- (The rest of your update logic goes here)
    
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `app_id` varchar(15) COLLATE utf8mb3_unicode_ci NOT NULL,
  `public_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `application_type` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` enum('Pending','Processing','Approved','Rejected','Completed') COLLATE utf8mb3_unicode_ci DEFAULT 'Pending',
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `assigned_to` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `application_data` json DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Triggers `applications`
--
DELIMITER $$
CREATE TRIGGER `tr_applications_audit_update` AFTER UPDATE ON `applications` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (NEW.assigned_to, 'Subject_Staff', 'UPDATE', 'applications', NEW.app_id,
            JSON_OBJECT('status', OLD.status, 'assigned_to', OLD.assigned_to),
            JSON_OBJECT('status', NEW.status, 'assigned_to', NEW.assigned_to), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `application_documents`
--

CREATE TABLE `application_documents` (
  `id` int NOT NULL,
  `app_id` varchar(15) COLLATE utf8mb3_unicode_ci NOT NULL,
  `doc_title` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `file_size` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `log_id` int NOT NULL,
  `user_id` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `user_type` enum('Admin','Reception_Staff','Subject_Staff','Public') COLLATE utf8mb3_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `table_name` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `record_id` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb3_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb3_unicode_ci DEFAULT 'active'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`dep_id`, `name`, `created_at`, `updated_at`, `status`) VALUES
('DEP001', 'Administration', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP002', 'ADR', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP003', 'Accounts', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP004', 'NIC', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP005', 'Land', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP006', 'SSO', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DEP007', 'Planning', '2025-06-30 09:18:20', '2025-07-01 13:16:24', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `divisions`
--

CREATE TABLE `divisions` (
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb3_unicode_ci DEFAULT 'active'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `divisions`
--

INSERT INTO `divisions` (`division_id`, `name`, `dep_id`, `created_at`, `updated_at`, `status`) VALUES
('DIV001', 'IT', 'DEP001', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV002', 'Shroff', 'DEP003', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV003', 'BC', 'DEP002', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV004', 'Shroff Management', 'DEP003', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV005', 'NIC', 'DEP004', '2025-06-30 09:18:20', '2025-07-01 05:43:19', 'inactive'),
('DIV006', 'Women And Child', 'DEP006', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV007', 'Marriage Certificates', 'DEP002', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV008', 'Land Records', 'DEP004', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('DIV009', 'Aswesume', 'DEP007', '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `doc_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` enum('Personal','Office','Common') COLLATE utf8mb3_unicode_ci NOT NULL,
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `file_size` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `uploaded_by` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `sender_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `sender_type` enum('Admin','Reception_Staff','Subject_Staff') COLLATE utf8mb3_unicode_ci NOT NULL,
  `recipient_id` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `recipient_type` enum('Public','Staff','Group','All') COLLATE utf8mb3_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` enum('Info','Warning','Success','Error') COLLATE utf8mb3_unicode_ci DEFAULT 'Info',
  `status` enum('Pending','Accepted','Rejected','Completed') COLLATE utf8mb3_unicode_ci DEFAULT 'Pending',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `public_registry`
--

CREATE TABLE `public_registry` (
  `registry_id` int NOT NULL,
  `public_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `purpose` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `token_number` varchar(20) COLLATE utf8mb3_unicode_ci NOT NULL,
  `visit_date` date DEFAULT (curdate()),
  `visit_time` time DEFAULT (curtime()),
  `status` enum('Waiting','In_Progress','Completed','Cancelled') COLLATE utf8mb3_unicode_ci DEFAULT 'Waiting',
  `served_by` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Triggers `public_registry`
--
DELIMITER $$
CREATE TRIGGER `tr_public_registry_audit_insert` AFTER INSERT ON `public_registry` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.public_id, 'Reception_Staff', 'INSERT', 'public_registry', NEW.registry_id, 
            JSON_OBJECT('token_number', NEW.token_number, 'purpose', NEW.purpose), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `public_users`
--

CREATE TABLE `public_users` (
  `public_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb3_unicode_ci,
  `nic_number` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `qr_code_data` text COLLATE utf8mb3_unicode_ci,
  `id_card_issued` tinyint(1) DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Triggers `public_users`
--
DELIMITER $$
CREATE TRIGGER `tr_public_users_audit_insert` AFTER INSERT ON `public_users` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.public_id, 'Public', 'INSERT', 'public_users', NEW.public_id, 
            JSON_OBJECT('name', NEW.name, 'nic_number', NEW.nic_number), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `subject_staff`
--

CREATE TABLE `subject_staff` (
  `sub_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `post` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT 'active'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `subject_staff`
--

INSERT INTO `subject_staff` (`sub_id`, `name`, `post`, `dep_id`, `username`, `password`, `is_active`, `created_at`, `updated_at`, `status`) VALUES
('SUB001', 'Ahas', 'DO', 'DEP007', 'Ahas', '$2y$12$bsS2kVjijatdUEN3aL409emJdAYb/0eIUcTQcOlty87DX.jVfYNSK', 1, '2025-06-30 09:18:20', '2025-07-02 03:15:55', 'active'),
('SUB002', 'Farhana', 'ICT Assistant Officer', 'DEP001', 'docspec', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('SUB003', 'T.M.Mohemed Anzar', 'DS', 'DEP001', 'Anzar', '$2y$12$kHHQvbYZU82TbCz90n1MeuWs2or6tIQLjG5IykGtaQv/3LusgQn1S', 1, '2025-07-01 09:53:02', '2025-07-01 13:18:17', 'active'),
('SUB004', 'Mirfa', 'MSO', 'DEP001', 'Mirfa', '$2y$12$sqhCmAgB.W5TyUch5DXESuxGkKrWEAZAHq9Z4pkbea046af4/zQqu', 1, '2025-07-01 10:01:51', '2025-07-01 13:18:26', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `subject_staff_divisions`
--

CREATE TABLE `subject_staff_divisions` (
  `id` int NOT NULL,
  `sub_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `subject_staff_divisions`
--

INSERT INTO `subject_staff_divisions` (`id`, `sub_id`, `division_id`, `assigned_at`) VALUES
(8, 'SUB001', 'DIV007', '2025-07-02 03:15:55'),
(2, 'SUB002', 'DIV001', '2025-06-30 09:18:20'),
(3, 'SUB002', 'DIV007', '2025-06-30 09:18:20'),
(6, 'SUB003', 'DIV001', '2025-07-01 13:18:17'),
(7, 'SUB004', 'DIV001', '2025-07-01 13:18:26'),
(9, 'SUB001', 'DIV009', '2025-07-02 03:15:55');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb3_unicode_ci,
  `description` text COLLATE utf8mb3_unicode_ci,
  `updated_by` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`, `updated_by`, `updated_at`) VALUES
('site_name', 'DSK Kalmunai', 'Site name', NULL, '2025-06-30 09:18:20'),
('site_email', 'admin@dskkalmunai.lk', 'Official email address', NULL, '2025-06-30 09:18:20'),
('site_phone', '+94 67 2224455', 'Official phone number', NULL, '2025-06-30 09:18:20'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', NULL, '2025-06-30 09:18:20'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions', NULL, '2025-06-30 09:18:20'),
('application_fee_birth', '500.00', 'Birth certificate application fee', NULL, '2025-06-30 09:18:20'),
('application_fee_death', '500.00', 'Death certificate application fee', NULL, '2025-06-30 09:18:20'),
('application_fee_marriage', '750.00', 'Marriage certificate application fee', NULL, '2025-06-30 09:18:20'),
('token_prefix_format', 'DEP{dep_number}-{token_number}', 'Token number format', NULL, '2025-06-30 09:18:20'),
('id_card_validity_years', '5', 'ID card validity in years', NULL, '2025-06-30 09:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `token_management`
--

CREATE TABLE `token_management` (
  `token_id` int NOT NULL,
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `current_token_number` int DEFAULT '1',
  `queue_count` int DEFAULT '0',
  `status` enum('Active','Paused','Closed') COLLATE utf8mb3_unicode_ci DEFAULT 'Active',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `token_management`
--

INSERT INTO `token_management` (`token_id`, `dep_id`, `division_id`, `current_token_number`, `queue_count`, `status`, `last_updated`) VALUES
(1, 'DEP001', 'DIV001', 1, 0, 'Active', '2025-06-30 09:18:20'),
(2, 'DEP002', 'DIV002', 1, 0, 'Active', '2025-06-30 09:18:20'),
(3, 'DEP005', 'DIV005', 1, 0, 'Active', '2025-06-30 09:18:20'),
(4, 'DEP005', 'DIV006', 1, 0, 'Active', '2025-06-30 09:18:20'),
(5, 'DEP005', 'DIV007', 1, 0, 'Active', '2025-06-30 09:18:20'),
(6, 'DEP005', 'DIV008', 1, 0, 'Active', '2025-06-30 09:18:20');

--
-- Triggers `token_management`
--
DELIMITER $$
CREATE TRIGGER `tr_token_management_audit_update` AFTER UPDATE ON `token_management` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES ('SYSTEM', 'Reception_Staff', 'UPDATE', 'token_management', NEW.token_id,
            JSON_OBJECT('current_token_number', OLD.current_token_number, 'queue_count', OLD.queue_count),
            JSON_OBJECT('current_token_number', NEW.current_token_number, 'queue_count', NEW.queue_count), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `post` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `division_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `role` enum('Admin','Reception_Staff') COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT 'active'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `post`, `dep_id`, `division_id`, `role`, `username`, `password`, `is_active`, `created_at`, `updated_at`, `status`) VALUES
('USR001', 'System Administrator', 'Admin', 'DEP001', 'DIV001', 'Admin', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active'),
('USR002', 'Reception Staff', 'Front Desk Officer', 'DEP001', 'DIV001', 'Reception_Staff', 'reception', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-30 09:18:20', '2025-06-30 09:18:20', 'active');

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `tr_users_audit_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.user_id, 'Admin', 'INSERT', 'users', NEW.user_id, 
            JSON_OBJECT('name', NEW.name, 'post', NEW.post, 'role', NEW.role), NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_users_audit_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (NEW.user_id, 'Admin', 'UPDATE', 'users', NEW.user_id,
            JSON_OBJECT('name', OLD.name, 'post', OLD.post, 'role', OLD.role),
            JSON_OBJECT('name', NEW.name, 'post', NEW.post, 'role', NEW.role), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_application_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_application_summary` (
`app_id` varchar(15)
,`application_type` varchar(100)
,`status` enum('Pending','Processing','Approved','Rejected','Completed')
,`submitted_at` timestamp
,`applicant_name` varchar(100)
,`applicant_phone` varchar(20)
,`division_name` varchar(100)
,`assigned_staff_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_public_registry_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_public_registry_summary` (
`registry_id` int
,`public_name` varchar(100)
,`nic_number` varchar(20)
,`purpose` varchar(200)
,`department_name` varchar(100)
,`division_name` varchar(100)
,`token_number` varchar(20)
,`visit_date` date
,`status` enum('Waiting','In_Progress','Completed','Cancelled')
,`served_by_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_subject_staff_details`
-- (See below for the actual view)
--
CREATE TABLE `v_subject_staff_details` (
`sub_id` varchar(10)
,`name` varchar(100)
,`post` varchar(100)
,`username` varchar(50)
,`is_active` tinyint(1)
,`department_name` varchar(100)
,`assigned_divisions` text
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_token_status`
-- (See below for the actual view)
--
CREATE TABLE `v_token_status` (
`token_id` int
,`department_name` varchar(100)
,`division_name` varchar(100)
,`current_token_number` int
,`queue_count` int
,`status` enum('Active','Paused','Closed')
,`last_updated` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_user_details`
-- (See below for the actual view)
--
CREATE TABLE `v_user_details` (
`user_id` varchar(10)
,`name` varchar(100)
,`post` varchar(100)
,`role` enum('Admin','Reception_Staff')
,`username` varchar(50)
,`is_active` tinyint(1)
,`department_name` varchar(100)
,`division_name` varchar(100)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`app_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`application_type`),
  ADD KEY `idx_division` (`division_id`),
  ADD KEY `idx_applications_public_id` (`public_id`),
  ADD KEY `idx_applications_submitted_at` (`submitted_at`);

--
-- Indexes for table `application_documents`
--
ALTER TABLE `application_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `app_id` (`app_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user` (`user_id`,`user_type`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table` (`table_name`),
  ADD KEY `idx_date` (`created_at`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`dep_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `divisions`
--
ALTER TABLE `divisions`
  ADD PRIMARY KEY (`division_id`),
  ADD UNIQUE KEY `unique_division_per_dept` (`name`,`dep_id`),
  ADD KEY `dep_id` (`dep_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `idx_division` (`division_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_documents_uploaded_at` (`uploaded_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_recipient` (`recipient_id`,`recipient_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- Indexes for table `public_registry`
--
ALTER TABLE `public_registry`
  ADD PRIMARY KEY (`registry_id`),
  ADD KEY `public_id` (`public_id`),
  ADD KEY `dep_id` (`dep_id`),
  ADD KEY `division_id` (`division_id`),
  ADD KEY `served_by` (`served_by`),
  ADD KEY `idx_token_number` (`token_number`),
  ADD KEY `idx_visit_date` (`visit_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_public_registry_visit_date` (`visit_date`);

--
-- Indexes for table `public_users`
--
ALTER TABLE `public_users`
  ADD PRIMARY KEY (`public_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nic_number` (`nic_number`),
  ADD KEY `idx_public_users_username` (`username`),
  ADD KEY `idx_public_users_email` (`email`),
  ADD KEY `idx_public_users_nic` (`nic_number`);

--
-- Indexes for table `subject_staff`
--
ALTER TABLE `subject_staff`
  ADD PRIMARY KEY (`sub_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `dep_id` (`dep_id`),
  ADD KEY `idx_subject_staff_username` (`username`);

--
-- Indexes for table `subject_staff_divisions`
--
ALTER TABLE `subject_staff_divisions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_staff_division` (`sub_id`,`division_id`),
  ADD KEY `division_id` (`division_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `token_management`
--
ALTER TABLE `token_management`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `unique_token_per_division` (`dep_id`,`division_id`),
  ADD KEY `division_id` (`division_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `dep_id` (`dep_id`),
  ADD KEY `division_id` (`division_id`),
  ADD KEY `idx_users_username` (`username`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `application_documents`
--
ALTER TABLE `application_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `public_registry`
--
ALTER TABLE `public_registry`
  MODIFY `registry_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_staff_divisions`
--
ALTER TABLE `subject_staff_divisions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `token_management`
--
ALTER TABLE `token_management`
  MODIFY `token_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

-- --------------------------------------------------------

--
-- Structure for view `v_application_summary`
--
DROP TABLE IF EXISTS `v_application_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`dskalmun`@`localhost` SQL SECURITY DEFINER VIEW `v_application_summary`  AS SELECT `a`.`app_id` AS `app_id`, `a`.`application_type` AS `application_type`, `a`.`status` AS `status`, `a`.`submitted_at` AS `submitted_at`, `pu`.`name` AS `applicant_name`, `pu`.`phone` AS `applicant_phone`, `dv`.`name` AS `division_name`, `ss`.`name` AS `assigned_staff_name` FROM (((`applications` `a` join `public_users` `pu` on((`a`.`public_id` = `pu`.`public_id`))) join `divisions` `dv` on((`a`.`division_id` = `dv`.`division_id`))) left join `subject_staff` `ss` on((`a`.`assigned_to` = `ss`.`sub_id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `v_public_registry_summary`
--
DROP TABLE IF EXISTS `v_public_registry_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`dskalmun`@`localhost` SQL SECURITY DEFINER VIEW `v_public_registry_summary`  AS SELECT `pr`.`registry_id` AS `registry_id`, `pu`.`name` AS `public_name`, `pu`.`nic_number` AS `nic_number`, `pr`.`purpose` AS `purpose`, `d`.`name` AS `department_name`, `dv`.`name` AS `division_name`, `pr`.`token_number` AS `token_number`, `pr`.`visit_date` AS `visit_date`, `pr`.`status` AS `status`, `ss`.`name` AS `served_by_name` FROM ((((`public_registry` `pr` join `public_users` `pu` on((`pr`.`public_id` = `pu`.`public_id`))) join `departments` `d` on((`pr`.`dep_id` = `d`.`dep_id`))) join `divisions` `dv` on((`pr`.`division_id` = `dv`.`division_id`))) left join `subject_staff` `ss` on((`pr`.`served_by` = `ss`.`sub_id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `v_subject_staff_details`
--
DROP TABLE IF EXISTS `v_subject_staff_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`dskalmun`@`localhost` SQL SECURITY DEFINER VIEW `v_subject_staff_details`  AS SELECT `ss`.`sub_id` AS `sub_id`, `ss`.`name` AS `name`, `ss`.`post` AS `post`, `ss`.`username` AS `username`, `ss`.`is_active` AS `is_active`, `d`.`name` AS `department_name`, group_concat(`dv`.`name` separator ', ') AS `assigned_divisions` FROM (((`subject_staff` `ss` join `departments` `d` on((`ss`.`dep_id` = `d`.`dep_id`))) join `subject_staff_divisions` `ssd` on((`ss`.`sub_id` = `ssd`.`sub_id`))) join `divisions` `dv` on((`ssd`.`division_id` = `dv`.`division_id`))) GROUP BY `ss`.`sub_id` ;

-- --------------------------------------------------------

--
-- Structure for view `v_token_status`
--
DROP TABLE IF EXISTS `v_token_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`dskalmun`@`localhost` SQL SECURITY DEFINER VIEW `v_token_status`  AS SELECT `tm`.`token_id` AS `token_id`, `d`.`name` AS `department_name`, `dv`.`name` AS `division_name`, `tm`.`current_token_number` AS `current_token_number`, `tm`.`queue_count` AS `queue_count`, `tm`.`status` AS `status`, `tm`.`last_updated` AS `last_updated` FROM ((`token_management` `tm` join `departments` `d` on((`tm`.`dep_id` = `d`.`dep_id`))) join `divisions` `dv` on((`tm`.`division_id` = `dv`.`division_id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `v_user_details`
--
DROP TABLE IF EXISTS `v_user_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`dskalmun`@`localhost` SQL SECURITY DEFINER VIEW `v_user_details`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`name` AS `name`, `u`.`post` AS `post`, `u`.`role` AS `role`, `u`.`username` AS `username`, `u`.`is_active` AS `is_active`, `d`.`name` AS `department_name`, `dv`.`name` AS `division_name` FROM ((`users` `u` join `departments` `d` on((`u`.`dep_id` = `d`.`dep_id`))) join `divisions` `dv` on((`u`.`division_id` = `dv`.`division_id`))) ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
