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
        !isset($data['username']) || empty(trim($data['username'])) ||
        !isset($data['password']) || empty($data['password']) ||
        !isset($data['divisions']) || !is_array($data['divisions']) || empty($data['divisions'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required including at least one division']);
        exit;
    }
    
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $divisions = $data['divisions'];
    
    try {
        // Start transaction
        $db->beginTransaction();
        
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$username]);
        
        if ($check_stmt->fetchColumn() > 0) {
            $db->rollback();
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Generate new subject staff ID
        $id_query = "SELECT MAX(CAST(SUBSTRING(sub_id, 4) AS UNSIGNED)) as max_id FROM subject_staff WHERE sub_id LIKE 'SUB%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $sub_id = 'SUB' . str_pad($next_num, 3, '0', STR_PAD_LEFT);
        
        // Insert new subject staff
        $insert_query = "INSERT INTO subject_staff (sub_id, name, post, dep_id, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        $insert_stmt = $db->prepare($insert_query);
        $result = $insert_stmt->execute([$sub_id, $name, $post, $dep_id, $username, $password]);
        
        if (!$result) {
            $db->rollback();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create subject staff']);
            exit;
        }
        
        // Insert division assignments
        $div_insert_query = "INSERT INTO subject_staff_divisions (sub_id, division_id, assigned_at) VALUES (?, ?, NOW())";
        $div_insert_stmt = $db->prepare($div_insert_query);
        
        foreach ($divisions as $division_id) {
            $div_result = $div_insert_stmt->execute([$sub_id, $division_id]);
            if (!$div_result) {
                $db->rollback();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to assign divisions']);
                exit;
            }
        }
        
        // Commit transaction
        $db->commit();
        
        // Get department name for response
        $dept_query = "SELECT name FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        // Get division names for response
        $div_names_query = "SELECT name FROM divisions WHERE division_id IN (" . str_repeat('?,', count($divisions) - 1) . "?)";
        $div_names_stmt = $db->prepare($div_names_query);
        $div_names_stmt->execute($divisions);
        $division_names = $div_names_stmt->fetchAll(PDO::FETCH_COLUMN);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Subject staff created successfully',
            'staff' => [
                'sub_id' => $sub_id,
                'name' => $name,
                'post' => $post,
                'dep_id' => $dep_id,
                'department' => $dept_name,
                'divisions' => $divisions,
                'divisionNames' => $division_names,
                'username' => $username,
                'is_active' => true
            ]
        ]);
    } catch (PDOException $exception) {
        $db->rollback();
        error_log("Subject staff create error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
