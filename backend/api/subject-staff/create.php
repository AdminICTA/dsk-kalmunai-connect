
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $required = ['name', 'post', 'dep_id', 'divisions', 'username', 'password'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    
    if (empty($data['divisions']) || !is_array($data['divisions'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one division must be selected']);
        exit;
    }
    
    try {
        $db->beginTransaction();
        
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data['username']]);
        
        if ($check_stmt->fetchColumn() > 0) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
        // Generate subject staff ID
        $sub_id = 'SUB' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert new subject staff
        $query = "INSERT INTO subject_staff (sub_id, name, post, department_id, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $sub_id,
            $data['name'],
            $data['post'],
            $data['dep_id'],
            $data['username'],
            $hashed_password
        ]);
        
        // Insert division assignments
        $div_query = "INSERT INTO subject_staff_divisions (sub_id, division_id) VALUES (?, ?)";
        $div_stmt = $db->prepare($div_query);
        
        foreach ($data['divisions'] as $division_id) {
            $div_stmt->execute([$sub_id, $division_id]);
        }
        
        $db->commit();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Subject staff created successfully',
            'staff' => [
                'sub_id' => $sub_id,
                'name' => $data['name'],
                'username' => $data['username']
            ]
        ]);
    } catch (PDOException $exception) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
