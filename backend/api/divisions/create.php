
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['name']) || empty(trim($data['name'])) || !isset($data['dep_id']) || empty($data['dep_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division name and department ID are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $dep_id = $data['dep_id'];
    
    try {
        // Check if department exists
        $dept_check_query = "SELECT department_name FROM departments WHERE department_id = ? AND status = 'active'";
        $dept_check_stmt = $db->prepare($dept_check_query);
        $dept_check_stmt->execute([$dep_id]);
        $department = $dept_check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$department) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if division already exists in this department
        $check_query = "SELECT COUNT(*) FROM divisions WHERE name = ? AND dep_id = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$name, $dep_id]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division already exists in this department']);
            exit;
        }
        
        // Insert new division
        $query = "INSERT INTO divisions (name, dep_id, status, created_at) VALUES (?, ?, 'active', NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$name, $dep_id]);
        
        $division_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Division created successfully',
            'division' => [
                'id' => $division_id,
                'name' => $name,
                'department_id' => $dep_id,
                'department_name' => $department['department_name']
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
