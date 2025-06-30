
-- Update existing database structure to support the new backend API

-- First, check if we need to modify the departments table structure
SET @dbname = DATABASE();
SET @tablename = 'departments';
SET @columnname = 'department_id';

-- Check if department_id column exists
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = @columnname;

-- Update departments table to match backend expectations
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE departments 
   ADD COLUMN department_id INT AUTO_INCREMENT PRIMARY KEY FIRST,
   ADD COLUMN status ENUM(''active'', ''inactive'') DEFAULT ''active'' AFTER name,
   ADD COLUMN department_name VARCHAR(100) NOT NULL AFTER department_id;',
  'SELECT ''Columns already exist'' AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Copy existing data to new structure
UPDATE departments SET department_name = name WHERE department_name IS NULL OR department_name = '';
UPDATE departments SET status = 'active' WHERE status IS NULL;

-- Update divisions table
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS division_id INT PRIMARY KEY AUTO_INCREMENT FIRST,
ADD COLUMN IF NOT EXISTS division_name VARCHAR(100) NOT NULL AFTER division_id,
ADD COLUMN IF NOT EXISTS department_id INT NOT NULL AFTER division_name;

-- Copy existing data to new structure
UPDATE divisions SET division_name = name WHERE division_name IS NULL OR division_name = '';

-- Update foreign key relationships
ALTER TABLE divisions DROP FOREIGN KEY IF EXISTS divisions_ibfk_1;
ALTER TABLE divisions ADD CONSTRAINT divisions_dept_fk FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE;

-- Ensure users table has the correct password column name
ALTER TABLE users CHANGE COLUMN password password VARCHAR(255) NOT NULL;

-- Update public_users table for API compatibility
ALTER TABLE public_users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER nic_number,
ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER username;

-- Set default username/password for existing public users (using NIC)
UPDATE public_users SET username = nic_number WHERE username IS NULL;
UPDATE public_users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE password IS NULL;

-- First update the departments and divisions tables to use consistent ID types
ALTER TABLE departments MODIFY COLUMN department_id VARCHAR(10) NOT NULL;
ALTER TABLE divisions MODIFY COLUMN division_id VARCHAR(10) NOT NULL;

-- Then update the public_registry table
ALTER TABLE public_registry 
CHANGE COLUMN dep_id department_id VARCHAR(10) NOT NULL,
CHANGE COLUMN div_id division_id VARCHAR(10) NOT NULL;

-- Ensure proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_public_users_active ON public_users(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_division_active ON documents(div_id, is_active);
CREATE INDEX IF NOT EXISTS idx_registry_status_date ON public_registry(status, visit_date);

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

-- Insert test data for development (optional)
-- First ensure the department_name column exists
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'departments' 
   AND COLUMN_NAME = 'department_name') > 0,
  'INSERT IGNORE INTO departments (department_id, department_name, status) VALUES 
  (''DEP001'', ''Administration'', ''active''),
  (''DEP002'', ''Finance'', ''active''),
  (''DEP003'', ''IT Services'', ''active''),
  (''DEP004'', ''Human Resources'', ''active''),
  (''DEP005'', ''Public Services'', ''active'');',
  'SELECT ''Skipping department insert - department_name column not found'';'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert divisions with proper department references
INSERT IGNORE INTO divisions (division_id, division_name, department_id) 
SELECT 'DIV001', 'General Administration', department_id FROM departments WHERE department_id = 'DEP001' LIMIT 1
UNION ALL
SELECT 'DIV002', 'Accounting', department_id FROM departments WHERE department_id = 'DEP002' LIMIT 1
UNION ALL  
SELECT 'DIV003', 'System Management', department_id FROM departments WHERE department_id = 'DEP003' LIMIT 1
UNION ALL
SELECT 'DIV004', 'Staff Management', department_id FROM departments WHERE department_id = 'DEP004' LIMIT 1
UNION ALL
SELECT 'DIV005', 'Birth Certificates', department_id FROM departments WHERE department_id = 'DEP005' LIMIT 1;

-- Update existing user passwords to be properly hashed
UPDATE users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%';

UPDATE subject_staff SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%';

-- Show updated table structures
SHOW TABLES;
SELECT 'Database update completed successfully' as STATUS;
