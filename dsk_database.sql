
-- DSK Kalmunai Database Structure
-- Database: dskalmun_Rapp
-- Host: 162.214.204.205 or node238.r-usdatacenter.register.lk
-- Username: dskalmun_Admin
-- Password: Itadmin@1993

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS dskalmun_Rapp;
USE dskalmun_Rapp;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Divisions table
CREATE TABLE IF NOT EXISTS divisions (
    division_id INT AUTO_INCREMENT PRIMARY KEY,
    division_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    UNIQUE KEY unique_division_per_dept (division_name, department_id)
);

-- Users table (Admin and Reception Staff)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    post VARCHAR(100) NOT NULL,
    dep_id INT NOT NULL,
    div_id INT NOT NULL,
    role ENUM('Admin', 'Reception_Staff') NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE
);

-- Subject Staff table
CREATE TABLE IF NOT EXISTS subject_staff (
    sub_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    post VARCHAR(100) NOT NULL,
    dep_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- Subject Staff Divisions Assignment table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS subject_staff_divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub_id VARCHAR(10) NOT NULL,
    div_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sub_id) REFERENCES subject_staff(sub_id) ON DELETE CASCADE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_division (sub_id, div_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    doc_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('Personal', 'Office', 'Common') NOT NULL,
    div_id INT NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size VARCHAR(20),
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(10) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    INDEX idx_division (div_id),
    INDEX idx_type (type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Public Users table (for citizens)
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
CREATE TABLE IF NOT EXISTS public_registry (
    registry_id INT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(10) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    dep_id INT NOT NULL,
    div_id INT NOT NULL,
    token_number VARCHAR(20) NOT NULL,
    visit_date DATE DEFAULT (CURRENT_DATE),
    visit_time TIME DEFAULT (CURRENT_TIME),
    status ENUM('Waiting', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Waiting',
    served_by VARCHAR(10),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (public_id) REFERENCES public_users(public_id) ON DELETE CASCADE,
    FOREIGN KEY (dep_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    FOREIGN KEY (served_by) REFERENCES subject_staff(sub_id) ON DELETE SET NULL,
    INDEX idx_token_number (token_number),
    INDEX idx_visit_date (visit_date),
    INDEX idx_status (status)
);

-- Token Management table
CREATE TABLE IF NOT EXISTS token_management (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    dep_id INT NOT NULL,
    div_id INT NOT NULL,
    current_token_number INT DEFAULT 1,
    queue_count INT DEFAULT 0,
    status ENUM('Active', 'Paused', 'Closed') DEFAULT 'Active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dep_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    UNIQUE KEY unique_token_per_division (dep_id, div_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS applications (
    app_id VARCHAR(15) PRIMARY KEY,
    public_id VARCHAR(10) NOT NULL,
    application_type VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Processing', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    div_id INT NOT NULL,
    assigned_to VARCHAR(10),
    application_data JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (public_id) REFERENCES public_users(public_id) ON DELETE CASCADE,
    FOREIGN KEY (div_id) REFERENCES divisions(division_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES subject_staff(sub_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_type (application_type),
    INDEX idx_division (div_id)
);

-- Application Documents table (supporting documents for applications)
CREATE TABLE IF NOT EXISTS application_documents (
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
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    description TEXT,
    updated_by VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
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
INSERT INTO departments (department_name) VALUES 
('Administration'),
('Finance'),
('IT Services'),
('Human Resources'),
('Public Services')
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name);

-- Divisions
INSERT INTO divisions (division_name, department_id) VALUES 
('General Administration', 1),
('Accounting', 2),
('System Management', 3),
('Staff Management', 4),
('Birth Certificates', 5),
('Death Certificates', 5),
('Marriage Certificates', 5),
('Land Records', 5)
ON DUPLICATE KEY UPDATE division_name = VALUES(division_name);

-- Default Admin User
INSERT INTO users (user_id, name, post, dep_id, div_id, role, username, password) VALUES 
('USR001', 'System Administrator', 'Admin', 3, 3, 'Admin', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Reception Staff
INSERT INTO users (user_id, name, post, dep_id, div_id, role, username, password) VALUES 
('USR002', 'Reception Officer', 'Front Desk Officer', 1, 1, 'Reception_Staff', 'reception', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Subject Staff
INSERT INTO subject_staff (sub_id, name, post, dep_id, username, password) VALUES 
('SUB001', 'Certificate Officer', 'Senior Officer', 5, 'certofficer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('SUB002', 'Document Specialist', 'Assistant Officer', 1, 'docspec', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Subject Staff Division Assignments
INSERT INTO subject_staff_divisions (sub_id, div_id) VALUES 
('SUB001', 5),
('SUB001', 6),
('SUB001', 7),
('SUB002', 1),
('SUB002', 8)
ON DUPLICATE KEY UPDATE sub_id = VALUES(sub_id);

-- Initialize Token Management for all divisions
INSERT INTO token_management (dep_id, div_id, current_token_number, queue_count, status) VALUES 
(1, 1, 1, 0, 'Active'),
(2, 2, 1, 0, 'Active'),
(5, 5, 1, 0, 'Active'),
(5, 6, 1, 0, 'Active'),
(5, 7, 1, 0, 'Active'),
(5, 8, 1, 0, 'Active')
ON DUPLICATE KEY UPDATE dep_id = VALUES(dep_id);

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
('id_card_validity_years', '5', 'ID card validity in years')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_subject_staff_username ON subject_staff(username);
CREATE INDEX IF NOT EXISTS idx_public_users_username ON public_users(username);
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public_users(email);
CREATE INDEX IF NOT EXISTS idx_public_users_nic ON public_users(nic_number);
CREATE INDEX IF NOT EXISTS idx_applications_public_id ON applications(public_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_public_registry_visit_date ON public_registry(visit_date);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON dskalmun_Rapp.* TO 'dskalmun_Admin'@'%';
GRANT ALL PRIVILEGES ON dskalmun_Rapp.* TO 'dskalmun_Admin'@'localhost';
FLUSH PRIVILEGES;
