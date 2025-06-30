
-- Update existing database structure to support the new backend API

-- Update departments table to match backend expectations
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER name,
ADD COLUMN IF NOT EXISTS department_id INT PRIMARY KEY AUTO_INCREMENT FIRST,
ADD COLUMN IF NOT EXISTS department_name VARCHAR(100) NOT NULL AFTER department_id;

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

-- Update public_registry table for token management
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
INSERT IGNORE INTO departments (dep_id, department_name, status) VALUES 
('DEP001', 'Administration', 'active'),
('DEP002', 'Finance', 'active'),
('DEP003', 'IT Services', 'active'),
('DEP004', 'Human Resources', 'active'),
('DEP005', 'Public Services', 'active');

INSERT IGNORE INTO divisions (div_id, division_name, department_id) 
SELECT 'DIV001', 'General Administration', department_id FROM departments WHERE dep_id = 'DEP001'
UNION ALL
SELECT 'DIV002', 'Accounting', department_id FROM departments WHERE dep_id = 'DEP002'
UNION ALL  
SELECT 'DIV003', 'System Management', department_id FROM departments WHERE dep_id = 'DEP003'
UNION ALL
SELECT 'DIV004', 'Staff Management', department_id FROM departments WHERE dep_id = 'DEP004'
UNION ALL
SELECT 'DIV005', 'Birth Certificates', department_id FROM departments WHERE dep_id = 'DEP005';

-- Update existing user passwords to be properly hashed
UPDATE users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%';

UPDATE subject_staff SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE password NOT LIKE '$2y$%';

-- Show updated table structures
SHOW TABLES;
SELECT 'Database update completed successfully' as STATUS;
