-- This script completely resets the dskalmun_Rapp database.
-- It drops all existing tables and views, then rebuilds the entire schema and inserts initial data.
-- WARNING: All existing data will be lost when running this script.

-- Use the correct database
USE dskalmun_Rapp;

-- Temporarily disable foreign key checks to allow dropping tables.
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing views if they exist
DROP VIEW IF EXISTS v_public_registry_summary;
DROP VIEW IF EXISTS v_token_status;
DROP VIEW IF EXISTS v_application_summary;
DROP VIEW IF EXISTS v_subject_staff_details;
DROP VIEW IF EXISTS v_user_details;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS public_registry;
DROP TABLE IF EXISTS token_management;
DROP TABLE IF EXISTS subject_staff_divisions;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subject_staff;
DROP TABLE IF EXISTS divisions;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS public_users;
DROP TABLE IF EXISTS system_settings;
-- Note: Triggers associated with tables are dropped automatically when the table is dropped.

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Recreate all tables, views, and insert initial data

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    dep_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Divisions table
CREATE TABLE IF NOT EXISTS divisions (
    division_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dep_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(dep_id) ON DELETE CASCADE,
    UNIQUE KEY unique_division_per_dept (name, dep_id)
);

-- Users table (Admin and Reception Staff)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    post VARCHAR(100) NOT NULL,
    dep_id VARCHAR(10) NOT NULL,
    division_id VARCHAR(10) NOT NULL,
    role ENUM('Admin', 'Reception_Staff') NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(dep_id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE
);

-- Subject Staff table
CREATE TABLE IF NOT EXISTS subject_staff (
    sub_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    post VARCHAR(100) NOT NULL,
    dep_id VARCHAR(10) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(dep_id) ON DELETE CASCADE
);

-- Subject Staff Divisions Assignment table
CREATE TABLE IF NOT EXISTS subject_staff_divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub_id VARCHAR(10) NOT NULL,
    division_id VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sub_id) REFERENCES subject_staff(sub_id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_division (sub_id, division_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    doc_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('Personal', 'Office', 'Common') NOT NULL,
    division_id VARCHAR(10) NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size VARCHAR(20),
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(10) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    INDEX idx_division (division_id),
    INDEX idx_type (type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Public Users table
CREATE TABLE IF NOT EXISTS public_users (
    public_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    nic_number VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    qr_code_data TEXT,
    id_card_issued BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Public Registry table (for visit tracking)
CREATE TABLE public_registry (
    registry_id INT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(10) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    dep_id VARCHAR(10) NOT NULL,
    division_id VARCHAR(10) NOT NULL,
    token_number VARCHAR(20) NOT NULL,
    visit_date DATE DEFAULT (CURRENT_DATE),
    visit_time TIME DEFAULT (CURRENT_TIME),
    status ENUM('Waiting', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Waiting',
    served_by VARCHAR(10),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (public_id) REFERENCES public_users(public_id) ON DELETE CASCADE,
    FOREIGN KEY (dep_id) REFERENCES departments(dep_id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    FOREIGN KEY (served_by) REFERENCES subject_staff(sub_id) ON DELETE SET NULL,
    INDEX idx_token_number (token_number),
    INDEX idx_visit_date (visit_date),
    INDEX idx_status (status)
);

-- Token Management table
CREATE TABLE token_management (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    dep_id VARCHAR(10) NOT NULL,
    division_id VARCHAR(10) NOT NULL,
    current_token_number INT DEFAULT 1,
    queue_count INT DEFAULT 0,
    status ENUM('Active', 'Paused', 'Closed') DEFAULT 'Active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(dep_id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    UNIQUE KEY unique_token_per_division (dep_id, division_id)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(10) NOT NULL,
    sender_type ENUM('Admin', 'Reception_Staff', 'Subject_Staff') NOT NULL,
    recipient_id VARCHAR(10),
    recipient_type ENUM('Public', 'Staff', 'Group', 'All') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Info', 'Warning', 'Success', 'Error') DEFAULT 'Info',
    status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_id, recipient_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Applications table (for public service requests)
CREATE TABLE applications (
    app_id VARCHAR(15) PRIMARY KEY,
    public_id VARCHAR(10) NOT NULL,
    application_type VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Processing', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    division_id VARCHAR(10) NOT NULL,
    assigned_to VARCHAR(10),
    application_data JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (public_id) REFERENCES public_users(public_id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES subject_staff(sub_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_type (application_type),
    INDEX idx_division (division_id)
);

-- Application Documents table (supporting documents for applications)
CREATE TABLE application_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id VARCHAR(15) NOT NULL,
    doc_title VARCHAR(200) NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size VARCHAR(20),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES applications(app_id) ON DELETE CASCADE
);

-- System Settings table
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    description TEXT,
    updated_by VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10),
    user_type ENUM('Admin', 'Reception_Staff', 'Subject_Staff', 'Public') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(20),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_date (created_at)
);

-- Insert initial data
-- Departments
INSERT INTO departments (dep_id, name) VALUES 
('DEP001', 'Administration'),
('DEP002', 'ADR'),
('DEP003', 'Accounts'),
('DEP004', 'NIC'),
('DEP005', 'Land'),
('DEP006', 'SSO'),
('DEP007', 'Planning');

-- Divisions
INSERT INTO divisions (division_id, name, dep_id) VALUES 
('DIV001', 'IT', 'DEP001'),
('DIV002', 'Shroff', 'DEP003'),
('DIV003', 'BC', 'DEP002'),
('DIV004', 'Shroff Management', 'DEP003'),
('DIV005', 'NIC', 'DEP004'),
('DIV006', 'Women And Child', 'DEP006'),
('DIV007', 'Marriage Certificates', 'DEP002'),
('DIV008', 'Land Records', 'DEP004'),
('DIV009', 'Aswesume', 'DEP007');

-- Default Admin User
INSERT INTO users (user_id, name, post, dep_id, division_id, role, username, password) VALUES 
('USR001', 'System Administrator', 'Admin', 'DEP001', 'DIV001', 'Admin', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Reception Staff
INSERT INTO users (user_id, name, post, dep_id, division_id, role, username, password) VALUES 
('USR002', 'Reception Staff', 'Front Desk Officer', 'DEP001', 'DIV001', 'Reception_Staff', 'reception', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Subject Staff
INSERT INTO subject_staff (sub_id, name, post, dep_id, username, password) VALUES 
('SUB001', 'Ahas', 'DO', 'DEP007', 'certofficer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('SUB002', 'Farhana', 'ICT Assistant Officer', 'DEP001', 'docspec', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Subject Staff Division Assignments
INSERT INTO subject_staff_divisions (sub_id, division_id) VALUES 
('SUB001', 'DIV007'),
('SUB002', 'DIV001'),
('SUB002', 'DIV007');

-- Initialize Token Management for all divisions
INSERT INTO token_management (dep_id, division_id, current_token_number, queue_count, status) VALUES 
('DEP001', 'DIV001', 1, 0, 'Active'),
('DEP002', 'DIV002', 1, 0, 'Active'),
('DEP005', 'DIV005', 1, 0, 'Active'),
('DEP005', 'DIV006', 1, 0, 'Active'),
('DEP005', 'DIV007', 1, 0, 'Active'),
('DEP005', 'DIV008', 1, 0, 'Active');

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('site_name', 'DSK Kalmunai', 'Site name'),
('site_email', 'admin@dskkalmunai.lk', 'Official email address'),
('site_phone', '+94 67 2224455', 'Official phone number'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions'),
('application_fee_birth', '500.00', 'Birth certificate application fee'),
('application_fee_death', '500.00', 'Death certificate application fee'),
('application_fee_marriage', '750.00', 'Marriage certificate application fee'),
('token_prefix_format', 'DEP{dep_number}-{token_number}', 'Token number format'),
('id_card_validity_years', '5', 'ID card validity in years');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subject_staff_username ON subject_staff(username);
CREATE INDEX idx_public_users_username ON public_users(username);
CREATE INDEX idx_public_users_email ON public_users(email);
CREATE INDEX idx_public_users_nic ON public_users(nic_number);
CREATE INDEX idx_applications_public_id ON applications(public_id);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_public_registry_visit_date ON public_registry(visit_date);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create views for common queries
CREATE VIEW v_user_details AS 
SELECT 
    u.user_id, 
    u.name, 
    u.post, 
    u.role, 
    u.username, 
    u.is_active, 
    d.name as department_name, 
    dv.name as division_name 
FROM users u
JOIN departments d ON u.dep_id = d.dep_id
JOIN divisions dv ON u.division_id = dv.division_id;

CREATE VIEW v_subject_staff_details AS
SELECT 
    ss.sub_id,
    ss.name,
    ss.post,
    ss.username,
    ss.is_active,
    d.name as department_name,
    GROUP_CONCAT(dv.name SEPARATOR ', ') as assigned_divisions
FROM subject_staff ss
JOIN departments d ON ss.dep_id = d.dep_id
JOIN subject_staff_divisions ssd ON ss.sub_id = ssd.sub_id
JOIN divisions dv ON ssd.division_id = dv.division_id
GROUP BY ss.sub_id;

CREATE VIEW v_application_summary AS
SELECT 
    a.app_id,
    a.application_type,
    a.status,
    a.submitted_at,
    pu.name as applicant_name,
    pu.phone as applicant_phone,
    dv.name as division_name,
    ss.name as assigned_staff_name
FROM applications a
JOIN public_users pu ON a.public_id = pu.public_id
JOIN divisions dv ON a.division_id = dv.division_id
LEFT JOIN subject_staff ss ON a.assigned_to = ss.sub_id;

CREATE VIEW v_token_status AS
SELECT 
    tm.token_id,
    d.name as department_name,
    dv.name as division_name,
    tm.current_token_number,
    tm.queue_count,
    tm.status,
    tm.last_updated
FROM token_management tm
JOIN departments d ON tm.dep_id = d.dep_id
JOIN divisions dv ON tm.division_id = dv.division_id;

CREATE VIEW v_public_registry_summary AS
SELECT 
    pr.registry_id,
    pu.name as public_name,
    pu.nic_number,
    pr.purpose,
    d.name as department_name,
    dv.name as division_name,
    pr.token_number,
    pr.visit_date,
    pr.status,
    ss.name as served_by_name
FROM public_registry pr
JOIN public_users pu ON pr.public_id = pu.public_id
JOIN departments d ON pr.dep_id = d.dep_id
JOIN divisions dv ON pr.division_id = dv.division_id
LEFT JOIN subject_staff ss ON pr.served_by = ss.sub_id;

-- Add triggers for audit logging
DELIMITER //

CREATE TRIGGER tr_users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.user_id, 'Admin', 'INSERT', 'users', NEW.user_id, 
            JSON_OBJECT('name', NEW.name, 'post', NEW.post, 'role', NEW.role), NOW());
END//

CREATE TRIGGER tr_users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (NEW.user_id, 'Admin', 'UPDATE', 'users', NEW.user_id,
            JSON_OBJECT('name', OLD.name, 'post', OLD.post, 'role', OLD.role),
            JSON_OBJECT('name', NEW.name, 'post', NEW.post, 'role', NEW.role), NOW());
END//

CREATE TRIGGER tr_public_users_audit_insert
AFTER INSERT ON public_users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.public_id, 'Public', 'INSERT', 'public_users', NEW.public_id, 
            JSON_OBJECT('name', NEW.name, 'nic_number', NEW.nic_number), NOW());
END//

CREATE TRIGGER tr_public_registry_audit_insert
AFTER INSERT ON public_registry
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, new_values, created_at)
    VALUES (NEW.public_id, 'Reception_Staff', 'INSERT', 'public_registry', NEW.registry_id, 
            JSON_OBJECT('token_number', NEW.token_number, 'purpose', NEW.purpose), NOW());
END//

CREATE TRIGGER tr_token_management_audit_update
AFTER UPDATE ON token_management
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES ('SYSTEM', 'Reception_Staff', 'UPDATE', 'token_management', NEW.token_id,
            JSON_OBJECT('current_token_number', OLD.current_token_number, 'queue_count', OLD.queue_count),
            JSON_OBJECT('current_token_number', NEW.current_token_number, 'queue_count', NEW.queue_count), NOW());
END//

CREATE TRIGGER tr_applications_audit_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, user_type, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (NEW.assigned_to, 'Subject_Staff', 'UPDATE', 'applications', NEW.app_id,
            JSON_OBJECT('status', OLD.status, 'assigned_to', OLD.assigned_to),
            JSON_OBJECT('status', NEW.status, 'assigned_to', NEW.assigned_to), NOW());
END//

DELIMITER ; 