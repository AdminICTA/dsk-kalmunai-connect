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
    if (!isset($data['name']) || empty(trim($data['name'])) || !isset($data['dep_id']) || empty($data['dep_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division name and department ID are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $dep_id = $data['dep_id'];
    
    try {
        // Check if department exists
        $dept_check_query = "SELECT name FROM departments WHERE dep_id = ? AND status = 'active'";
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
        
        // Get the next division_id
        $id_query = "SELECT MAX(CAST(SUBSTRING(division_id, 4) AS UNSIGNED)) as max_id FROM divisions WHERE division_id LIKE 'DIV%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $division_id = 'DIV' . str_pad($next_num, 3, '0', STR_PAD_LEFT);
        
        // Insert new division
        $query = "INSERT INTO divisions (division_id, name, dep_id, status, created_at) VALUES (?, ?, ?, 'active', NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$division_id, $name, $dep_id]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Division created successfully',
            'division' => [
                'division_id' => $division_id,
                'name' => $name,
                'dep_id' => $dep_id,
                'department_name' => $department['name'],
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
