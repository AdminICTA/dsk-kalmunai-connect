
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['user_id']) || !isset($data['name']) || empty(trim($data['name'])) || 
        !isset($data['post']) || empty(trim($data['post'])) ||
        !isset($data['dep_id']) || !isset($data['div_id']) ||
        !isset($data['role']) || !isset($data['username'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    $user_id = $data['user_id'];
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $div_id = $data['div_id'];
    $role = $data['role'];
    $username = trim($data['username']);
    
    try {
        // Check if user exists
        $check_query = "SELECT COUNT(*) FROM users WHERE user_id = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$user_id]);
        
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }
        
        // Check if new username already exists (excluding current user)
        $username_check_query = "SELECT COUNT(*) FROM users WHERE username = ? AND user_id != ? AND is_active = 1";
        $username_check_stmt = $db->prepare($username_check_query);
        $username_check_stmt->execute([$username, $user_id]);
        
        if ($username_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Update user (with or without password)
        if (isset($data['password']) && !empty($data['password'])) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $query = "UPDATE users SET name = ?, post = ?, dep_id = ?, div_id = ?, role = ?, username = ?, password = ?, updated_at = NOW() WHERE user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$name, $post, $dep_id, $div_id, $role, $username, $password, $user_id]);
        } else {
            $query = "UPDATE users SET name = ?, post = ?, dep_id = ?, div_id = ?, role = ?, username = ?, updated_at = NOW() WHERE user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$name, $post, $dep_id, $div_id, $role, $username, $user_id]);
        }
        
        // Get department and division names for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $div_query = "SELECT division_name FROM divisions WHERE division_id = ?";
        $div_stmt = $db->prepare($div_query);
        $div_stmt->execute([$div_id]);
        $div_name = $div_stmt->fetchColumn();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => [
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
