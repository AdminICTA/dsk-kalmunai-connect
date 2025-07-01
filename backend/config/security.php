
<?php
class Security {
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            foreach ($input as $key => $value) {
                $input[$key] = self::sanitizeInput($value);
            }
            return $input;
        }
        
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function validatePassword($password) {
        // Minimum 8 characters, at least one letter and one number
        return preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/', $password);
    }
    
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    public static function preventSQLInjection($input) {
        // This is handled by PDO prepared statements
        // But we can add additional checks here
        $dangerous_patterns = [
            '/(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i',
            '/(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/i',
            '/[\'";]/i'
        ];
        
        foreach ($dangerous_patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                throw new Exception('Potentially dangerous input detected');
            }
        }
        
        return $input;
    }
}
?>
