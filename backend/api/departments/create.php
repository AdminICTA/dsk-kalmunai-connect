
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
    
    try {
        // Check if department already exists
        $check_query = "SELECT COUNT(*) FROM departments WHERE department_name = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$name]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Department already exists']);
            exit;
        }
        
        // Get the next department ID
        $id_query = "SELECT MAX(CAST(SUBSTRING(department_id, 4) AS UNSIGNED)) as max_id FROM departments WHERE department_id LIKE 'DEP%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $department_id = 'DEP' . str_pad($next_num, 2, '0', STR_PAD_LEFT);
        
        // Insert new department
        $query = "INSERT INTO departments (department_id, department_name, status, created_at) VALUES (?, ?, 'active', NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$department_id, $name]);
        
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
