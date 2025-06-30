
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
    
    if (!isset($data['name']) || !isset($data['dep_id']) || empty(trim($data['name'])) || empty(trim($data['dep_id']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division name and department ID are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $dep_id = trim($data['dep_id']);
    
    try {
        // Check if department exists
        $dept_check = "SELECT COUNT(*) FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_check);
        $dept_stmt->execute([$dep_id]);
        
        if ($dept_stmt->fetchColumn() == 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if division already exists in this department
        $check_query = "SELECT COUNT(*) FROM divisions WHERE name = ? AND dep_id = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$name, $dep_id]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division already exists in this department']);
            exit;
        }
        
        // Generate division ID
        $div_id = 'DIV' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        // Insert new division
        $query = "INSERT INTO divisions (div_id, name, dep_id, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$div_id, $name, $dep_id]);
        
        // Get department name for response
        $dept_query = "SELECT name FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Division created successfully',
            'division' => [
                'id' => $div_id,
                'name' => $name,
                'department_id' => $dep_id,
                'department_name' => $dept_name
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
