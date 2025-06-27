
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
        !isset($data['dep_id']) || !isset($data['divisions']) ||
        !isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $divisions = $data['divisions'];
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    try {
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$username]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Generate new subject staff ID
        $id_query = "SELECT COUNT(*) FROM subject_staff";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $count = $id_stmt->fetchColumn();
        $sub_id = 'SUB' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        
        // Begin transaction
        $db->beginTransaction();
        
        // Insert new subject staff
        $query = "INSERT INTO subject_staff (sub_id, name, post, dep_id, username, password, is_active, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$sub_id, $name, $post, $dep_id, $username, $password]);
        
        // Insert division assignments
        $div_query = "INSERT INTO subject_staff_divisions (sub_id, div_id, assigned_at) VALUES (?, ?, NOW())";
        $div_stmt = $db->prepare($div_query);
        
        foreach ($divisions as $div_id) {
            $div_stmt->execute([$sub_id, $div_id]);
        }
        
        // Commit transaction
        $db->commit();
        
        // Get department name and division names for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $div_names_query = "SELECT division_name FROM divisions WHERE division_id IN (" . str_repeat('?,', count($divisions) - 1) . "?)";
        $div_names_stmt = $db->prepare($div_names_query);
        $div_names_stmt->execute($divisions);
        $div_names = $div_names_stmt->fetchAll(PDO::FETCH_COLUMN);
        
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
                'divisionNames' => $div_names,
                'username' => $username,
                'is_active' => true
            ]
        ]);
    } catch (PDOException $exception) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
