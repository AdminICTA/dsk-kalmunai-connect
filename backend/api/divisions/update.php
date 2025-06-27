
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
    if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name'])) || !isset($data['department_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division ID, name, and department ID are required']);
        exit;
    }
    
    $id = $data['id'];
    $name = trim($data['name']);
    $department_id = $data['department_id'];
    
    try {
        // Check if division exists
        $check_query = "SELECT COUNT(*) FROM divisions WHERE division_id = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Division not found']);
            exit;
        }
        
        // Check if department exists
        $dept_check_query = "SELECT COUNT(*) FROM departments WHERE department_id = ? AND status = 'active'";
        $dept_check_stmt = $db->prepare($dept_check_query);
        $dept_check_stmt->execute([$department_id]);
        
        if ($dept_check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if new name already exists in the department (excluding current division)
        $name_check_query = "SELECT COUNT(*) FROM divisions WHERE division_name = ? AND department_id = ? AND division_id != ? AND status = 'active'";
        $name_check_stmt = $db->prepare($name_check_query);
        $name_check_stmt->execute([$name, $department_id, $id]);
        
        if ($name_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division name already exists in this department']);
            exit;
        }
        
        // Update division
        $query = "UPDATE divisions SET division_name = ?, department_id = ?, updated_at = NOW() WHERE division_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$name, $department_id, $id]);
        
        // Get department name for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$department_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Division updated successfully',
            'division' => [
                'id' => $id,
                'name' => $name,
                'department_id' => $department_id,
                'department_name' => $dept_name,
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
