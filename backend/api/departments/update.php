
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
    if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Department ID and name are required']);
        exit;
    }
    
    $id = $data['id'];
    $name = trim($data['name']);
    
    try {
        // Check if department exists
        $check_query = "SELECT COUNT(*) FROM departments WHERE department_id = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if new name already exists (excluding current department)
        $name_check_query = "SELECT COUNT(*) FROM departments WHERE department_name = ? AND department_id != ? AND status = 'active'";
        $name_check_stmt = $db->prepare($name_check_query);
        $name_check_stmt->execute([$name, $id]);
        
        if ($name_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
            exit;
        }
        
        // Update department
        $query = "UPDATE departments SET department_name = ?, updated_at = NOW() WHERE department_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$name, $id]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Department updated successfully',
            'department' => [
                'id' => $id,
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
