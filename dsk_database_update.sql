
-- Update existing database structure to support the new backend API
-- This script updates the existing dskalmun_Rapp database to match backend expectations

USE dskalmun_Rapp;

-- First, let's check the current structure and update departments table
-- The existing table has department_id as INT, but we need to ensure it has the right structure

-- Add missing columns to departments table if they don't exist
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER department_name;

-- Update existing departments to have active status
UPDATE departments SET status = 'active' WHERE status IS NULL;

-- Add missing columns to divisions table if they don't exist
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER department_id;

-- Update existing divisions to have active status
UPDATE divisions SET status = 'active' WHERE status IS NULL;

-- Update public_registry table to use correct column names
-- Check if columns need to be renamed
SET @sql = CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
          AND TABLE_NAME = 'public_registry' 
          AND COLUMN_NAME = 'dep_id') > 0
    THEN 'ALTER TABLE public_registry CHANGE COLUMN dep_id department_id INT NOT NULL'
    ELSE 'SELECT "Column dep_id does not exist" as message'
END;

-- Execute the rename for dep_id to department_id
SET @sql_dep = CONCAT('ALTER TABLE public_registry CHANGE COLUMN dep_id department_id INT NOT NULL');
SET @sql_div = CONCAT('ALTER TABLE public_registry CHANGE COLUMN div_id division_id INT NOT NULL');

-- Only execute if columns exist
SET @check_dep = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
                  AND TABLE_NAME = 'public_registry' 
                  AND COLUMN_NAME = 'dep_id');

SET @check_div = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
                  AND TABLE_NAME = 'public_registry' 
                  AND COLUMN_NAME = 'div_id');

-- Update public_registry column names if needed
-- This is a safer approach without dynamic SQL
DROP PROCEDURE IF EXISTS UpdateRegistryColumns;

DELIMITER //
CREATE PROCEDURE UpdateRegistryColumns()
BEGIN
    -- Check and update dep_id to department_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'public_registry' 
               AND COLUMN_NAME = 'dep_id') THEN
        ALTER TABLE public_registry CHANGE COLUMN dep_id department_id INT NOT NULL;
    END IF;
    
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'public_registry' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE public_registry CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateRegistryColumns();
DROP PROCEDURE UpdateRegistryColumns;

-- Update applications table to use correct column names
DROP PROCEDURE IF EXISTS UpdateApplicationsColumns;

DELIMITER //
CREATE PROCEDURE UpdateApplicationsColumns()
BEGIN
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'applications' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE applications CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateApplicationsColumns();
DROP PROCEDURE UpdateApplicationsColumns;

-- Update documents table to use correct column names
DROP PROCEDURE IF EXISTS UpdateDocumentsColumns;

DELIMITER //
CREATE PROCEDURE UpdateDocumentsColumns()
BEGIN
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'documents' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE documents CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateDocumentsColumns();
DROP PROCEDURE UpdateDocumentsColumns;

-- Update token_management table to use correct column names
DROP PROCEDURE IF EXISTS UpdateTokenManagementColumns;

DELIMITER //
CREATE PROCEDURE UpdateTokenManagementColumns()
BEGIN
    -- Check and update dep_id to department_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'token_management' 
               AND COLUMN_NAME = 'dep_id') THEN
        ALTER TABLE token_management CHANGE COLUMN dep_id department_id INT NOT NULL;
    END IF;
    
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'token_management' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE token_management CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateTokenManagementColumns();
DROP PROCEDURE UpdateTokenManagementColumns;

-- Update users table to use correct column names
DROP PROCEDURE IF EXISTS UpdateUsersColumns;

DELIMITER //
CREATE PROCEDURE UpdateUsersColumns()
BEGIN
    -- Check and update dep_id to department_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'dep_id') THEN
        ALTER TABLE users CHANGE COLUMN dep_id department_id INT NOT NULL;
    END IF;
    
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE users CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateUsersColumns();
DROP PROCEDURE UpdateUsersColumns;

-- Update subject_staff table to use correct column names
DROP PROCEDURE IF EXISTS UpdateSubjectStaffColumns;

DELIMITER //
CREATE PROCEDURE UpdateSubjectStaffColumns()
BEGIN
    -- Check and update dep_id to department_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'subject_staff' 
               AND COLUMN_NAME = 'dep_id') THEN
        ALTER TABLE subject_staff CHANGE COLUMN dep_id department_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateSubjectStaffColumns();
DROP PROCEDURE UpdateSubjectStaffColumns;

-- Update subject_staff_divisions table to use correct column names
DROP PROCEDURE IF EXISTS UpdateSubjectStaffDivisionsColumns;

DELIMITER //
CREATE PROCEDURE UpdateSubjectStaffDivisionsColumns()
BEGIN
    -- Check and update div_id to division_id
    IF EXISTS (SELECT * FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dskalmun_Rapp' 
               AND TABLE_NAME = 'subject_staff_divisions' 
               AND COLUMN_NAME = 'div_id') THEN
        ALTER TABLE subject_staff_divisions CHANGE COLUMN div_id division_id INT NOT NULL;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL UpdateSubjectStaffDivisionsColumns();
DROP PROCEDURE UpdateSubjectStaffDivisionsColumns;

-- Ensure proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_divisions_status ON divisions(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_public_users_active ON public_users(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_division_active ON documents(division_id, is_active);
CREATE INDEX IF NOT EXISTS idx_registry_status_date ON public_registry(status, visit_date);

-- Update existing user passwords to be properly hashed (if not already)
UPDATE users 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%' AND password != '';

UPDATE subject_staff 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%' AND password != '';

-- Update public_users to have username and password if missing
UPDATE public_users 
SET username = nic_number 
WHERE username IS NULL OR username = '';

UPDATE public_users 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password IS NULL OR password = '';

-- Create API key table for future use
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(10) NOT NULL,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Show completion message
SELECT 'Database update completed successfully' as STATUS;

-- Show updated table structures for verification
SHOW TABLES;
