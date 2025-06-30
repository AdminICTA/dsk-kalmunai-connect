
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
<<<<<<< HEAD
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $required = ['name', 'post', 'department_id', 'division_id', 'role', 'username', 'password'];
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
=======
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['name']) || empty(trim($data['name'])) || 
        !isset($data['post']) || empty(trim($data['post'])) ||
        !isset($data['dep_id']) || !isset($data['div_id']) ||
        !isset($data['role']) || !isset($data['username']) || 
        !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $div_id = $data['div_id'];
    $role = $data['role'];
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    try {
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM users WHERE username = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$username]);
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
<<<<<<< HEAD
        // Generate user ID
        $user_id = 'USR' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $query = "INSERT INTO users (user_id, name, post, department_id, division_id, role, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['post'],
            $data['department_id'],
            $data['division_id'],
            $data['role'],
            $data['username'],
            $hashed_password
        ]);
=======
        // Generate new user ID
        $id_query = "SELECT COUNT(*) FROM users";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $count = $id_stmt->fetchColumn();
        $user_id = 'USR' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        
        // Insert new user
        $query = "INSERT INTO users (user_id, name, post, dep_id, div_id, role, username, password, is_active, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $name, $post, $dep_id, $div_id, $role, $username, $password]);
        
        // Get department and division names for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $div_query = "SELECT division_name FROM divisions WHERE division_id = ?";
        $div_stmt = $db->prepare($div_query);
        $div_stmt->execute([$div_id]);
        $div_name = $div_stmt->fetchColumn();
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => [
<<<<<<< HEAD
                'id' => $user_id,
                'name' => $data['name'],
                'username' => $data['username'],
                'role' => $data['role']
=======
                'user_id' => $user_id,
                'name' => $name,
                'post' => $post,
                'dep_id' => $dep_id,
                'department' => $dept_name,
                'div_id' => $div_id,
                'division' => $div_name,
                'role' => $role,
                'username' => $username,
                'is_active' => true
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
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
