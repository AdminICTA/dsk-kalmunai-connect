
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division ID and name are required']);
        exit;
    }
    
    $id = $data['id'];
    $name = trim($data['name']);
    
    try {
        // Check if division exists
        $check_query = "SELECT dep_id FROM divisions WHERE div_id = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        
        if ($check_stmt->rowCount() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Division not found']);
            exit;
        }
        
        $dep_id = $check_stmt->fetchColumn();
        
        // Check if new name already exists in same department (excluding current division)
        $name_check_query = "SELECT COUNT(*) FROM divisions WHERE name = ? AND dep_id = ? AND div_id != ?";
        $name_check_stmt = $db->prepare($name_check_query);
        $name_check_stmt->execute([$name, $dep_id, $id]);
        
        if ($name_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division name already exists in this department']);
            exit;
        }
        
        // Update division
        $query = "UPDATE divisions SET name = ?, updated_at = NOW() WHERE div_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$name, $id]);
        
        // Get department name for response
        $dept_query = "SELECT name FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Division updated successfully',
            'division' => [
                'id' => $id,
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
