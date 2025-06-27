
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
    if (!isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Department name is required']);
        exit;
    }
    
    $name = trim($data['name']);
    
    // Check if department already exists
    try {
        $check_query = "SELECT COUNT(*) FROM departments WHERE department_name = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$name]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Department already exists']);
            exit;
        }
        
        // Insert new department
        $query = "INSERT INTO departments (department_name, status, created_at) VALUES (?, 'active', NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$name]);
        
        $department_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Department created successfully',
            'department' => [
                'id' => $department_id,
                'name' => $name,
                'status' => 'active'
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
