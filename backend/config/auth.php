
<?php
include_once 'jwt.php';

class Auth {
    private $jwt;
    
    public function __construct() {
        $this->jwt = new JWT();
    }
    
    public function authenticate($requiredRole = null) {
        $headers = getallheaders();
        $token = null;
        
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
        } elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
        }
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No token provided']);
            exit;
        }
        
        $decoded = $this->jwt->verifyToken($token, $requiredRole);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
            exit;
        }
        
        return $decoded;
    }
    
    public function generateToken($user) {
        return $this->jwt->encode($user);
    }
}
?>
