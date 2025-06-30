-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 30, 2025 at 09:44 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `app_id` varchar(15) COLLATE utf8mb3_unicode_ci NOT NULL,
  `public_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `application_type` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` enum('Pending','Processing','Approved','Rejected','Completed') COLLATE utf8mb3_unicode_ci DEFAULT 'Pending',
  `div_id` int NOT NULL,
  `assigned_to` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `application_data` json DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

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
  `department_id` int NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb3_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administration', 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(2, 'Finance', 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(3, 'IT Services', 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(4, 'Human Resources', 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(5, 'Public Services', 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `divisions`
--

CREATE TABLE `divisions` (
  `division_id` int NOT NULL,
  `division_name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `department_id` int NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb3_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `divisions`
--

INSERT INTO `divisions` (`division_id`, `division_name`, `department_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'General Administration', 1, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(2, 'Accounting', 2, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(3, 'System Management', 3, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(4, 'Staff Management', 4, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(5, 'Birth Certificates', 5, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(6, 'Death Certificates', 5, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(7, 'Marriage Certificates', 5, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
(8, 'Land Records', 5, 'active', '2025-06-27 10:54:34', '2025-06-27 10:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `doc_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` enum('Personal','Office','Common') COLLATE utf8mb3_unicode_ci NOT NULL,
  `div_id` int NOT NULL,
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
  `dep_id` int NOT NULL,
  `div_id` int NOT NULL,
  `token_number` varchar(20) COLLATE utf8mb3_unicode_ci NOT NULL,
  `visit_date` date DEFAULT (curdate()),
  `visit_time` time DEFAULT (curtime()),
  `status` enum('Waiting','In_Progress','Completed','Cancelled') COLLATE utf8mb3_unicode_ci DEFAULT 'Waiting',
  `served_by` varchar(10) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `subject_staff`
--

CREATE TABLE `subject_staff` (
  `sub_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `post` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `subject_staff`
--

INSERT INTO `subject_staff` (`sub_id`, `name`, `post`, `dep_id`, `username`, `password`, `is_active`, `created_at`, `updated_at`) VALUES
('SUB001', 'Certificate Officer', 'Senior Officer', 5, 'certofficer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
('SUB002', 'Document Specialist', 'Assistant Officer', 1, 'docspec', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-27 10:54:34', '2025-06-27 10:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `subject_staff_divisions`
--

CREATE TABLE `subject_staff_divisions` (
  `id` int NOT NULL,
  `sub_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `div_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `subject_staff_divisions`
--

INSERT INTO `subject_staff_divisions` (`id`, `sub_id`, `div_id`, `assigned_at`) VALUES
(1, 'SUB001', 5, '2025-06-27 10:54:34'),
(2, 'SUB001', 6, '2025-06-27 10:54:34'),
(3, 'SUB001', 7, '2025-06-27 10:54:34'),
(4, 'SUB002', 1, '2025-06-27 10:54:34'),
(5, 'SUB002', 8, '2025-06-27 10:54:34');

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
('site_name', 'DSK Kalmunai', 'Site name', NULL, '2025-06-27 10:54:34'),
('site_email', 'admin@dskkalmunai.lk', 'Official email address', NULL, '2025-06-27 10:54:34'),
('site_phone', '+94 67 2224455', 'Official phone number', NULL, '2025-06-27 10:54:34'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', NULL, '2025-06-27 10:54:34'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions', NULL, '2025-06-27 10:54:34'),
('application_fee_birth', '500.00', 'Birth certificate application fee', NULL, '2025-06-27 10:54:34'),
('application_fee_death', '500.00', 'Death certificate application fee', NULL, '2025-06-27 10:54:34'),
('application_fee_marriage', '750.00', 'Marriage certificate application fee', NULL, '2025-06-27 10:54:34'),
('token_prefix_format', 'DEP{dep_number}-{token_number}', 'Token number format', NULL, '2025-06-27 10:54:34'),
('id_card_validity_years', '5', 'ID card validity in years', NULL, '2025-06-27 10:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `token_management`
--

CREATE TABLE `token_management` (
  `token_id` int NOT NULL,
  `dep_id` int NOT NULL,
  `div_id` int NOT NULL,
  `current_token_number` int DEFAULT '1',
  `queue_count` int DEFAULT '0',
  `status` enum('Active','Paused','Closed') COLLATE utf8mb3_unicode_ci DEFAULT 'Active',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `token_management`
--

INSERT INTO `token_management` (`token_id`, `dep_id`, `div_id`, `current_token_number`, `queue_count`, `status`, `last_updated`) VALUES
(1, 1, 1, 1, 0, 'Active', '2025-06-27 10:54:34'),
(2, 2, 2, 1, 0, 'Active', '2025-06-27 10:54:34'),
(3, 5, 5, 1, 0, 'Active', '2025-06-27 10:54:34'),
(4, 5, 6, 1, 0, 'Active', '2025-06-27 10:54:34'),
(5, 5, 7, 1, 0, 'Active', '2025-06-27 10:54:34'),
(6, 5, 8, 1, 0, 'Active', '2025-06-27 10:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` varchar(10) COLLATE utf8mb3_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `post` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `dep_id` int NOT NULL,
  `div_id` int NOT NULL,
  `role` enum('Admin','Reception_Staff') COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `post`, `dep_id`, `div_id`, `role`, `username`, `password`, `is_active`, `created_at`, `updated_at`) VALUES
('USR001', 'System Administrator', 'Admin', 3, 3, 'Admin', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-27 10:54:34', '2025-06-27 10:54:34'),
('USR002', 'Reception Officer', 'Front Desk Officer', 1, 1, 'Reception_Staff', 'reception', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2025-06-27 10:54:34', '2025-06-27 10:54:34');

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
  ADD KEY `idx_division` (`div_id`),
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
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `divisions`
--
ALTER TABLE `divisions`
  ADD PRIMARY KEY (`division_id`),
  ADD UNIQUE KEY `unique_division_per_dept` (`division_name`,`department_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `idx_division` (`div_id`),
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
  ADD KEY `div_id` (`div_id`),
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
  ADD UNIQUE KEY `unique_staff_division` (`sub_id`,`div_id`),
  ADD KEY `div_id` (`div_id`);

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
  ADD UNIQUE KEY `unique_token_per_division` (`dep_id`,`div_id`),
  ADD KEY `div_id` (`div_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `dep_id` (`dep_id`),
  ADD KEY `div_id` (`div_id`),
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
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `division_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `token_management`
--
ALTER TABLE `token_management`
  MODIFY `token_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
