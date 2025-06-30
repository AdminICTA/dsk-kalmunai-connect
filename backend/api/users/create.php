
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $required = ['name', 'post', 'dep_id', 'div_id', 'role', 'username', 'password'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    
    if (!in_array($data['role'], ['Admin', 'Reception_Staff'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid role. Must be Admin or Reception_Staff']);
        exit;
    }
    
    try {
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM users WHERE username = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data['username']]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Generate user ID
        $user_id = 'USR' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $query = "INSERT INTO users (user_id, name, post, dep_id, div_id, role, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['post'],
            $data['dep_id'],
            $data['div_id'],
            $data['role'],
            $data['username'],
            $hashed_password
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => [
                'id' => $user_id,
                'name' => $data['name'],
                'username' => $data['username'],
                'role' => $data['role']
            ]
        ]);
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
