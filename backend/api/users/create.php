<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['name']) || empty(trim($data['name'])) || 
        !isset($data['post']) || empty(trim($data['post'])) ||
        !isset($data['dep_id']) || empty($data['dep_id']) ||
        !isset($data['division_id']) || empty($data['division_id']) ||
        !isset($data['role']) || empty($data['role']) ||
        !isset($data['username']) || empty(trim($data['username'])) ||
        !isset($data['password']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $division_id = $data['division_id'];
    $role = $data['role'];
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    try {
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM users WHERE username = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$username]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Generate new user ID
        $id_query = "SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) as max_id FROM users WHERE user_id LIKE 'USR%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $user_id = 'USR' . str_pad($next_num, 3, '0', STR_PAD_LEFT);
        
        // Insert new user
        $query = "INSERT INTO users (user_id, name, post, dep_id, division_id, role, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $name, $post, $dep_id, $division_id, $role, $username, $password]);
        
        // Get department and division names for response
        $dept_query = "SELECT name FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $div_query = "SELECT name FROM divisions WHERE division_id = ?";
        $div_stmt = $db->prepare($div_query);
        $div_stmt->execute([$division_id]);
        $div_name = $div_stmt->fetchColumn();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => [
                'user_id' => $user_id,
                'name' => $name,
                'post' => $post,
                'dep_id' => $dep_id,
                'department' => $dept_name,
                'division_id' => $division_id,
                'division' => $div_name,
                'role' => $role,
                'username' => $username,
                'is_active' => true
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
