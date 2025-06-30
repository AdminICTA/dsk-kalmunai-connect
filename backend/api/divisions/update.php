
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division ID and name are required']);
        exit;
    }
    
    $id = $data['id'];
    $name = trim($data['name']);
    
    try {
        // Check if division exists
        $check_query = "SELECT d.div_id, d.dep_id, dept.department_name 
                        FROM divisions d 
                        JOIN departments dept ON d.dep_id = dept.department_id 
                        WHERE d.div_id = ? AND d.status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        $division = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$division) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Division not found']);
            exit;
        }
        
        // Check if new name already exists in the same department (excluding current division)
        $name_check_query = "SELECT COUNT(*) FROM divisions WHERE name = ? AND dep_id = ? AND div_id != ? AND status = 'active'";
        $name_check_stmt = $db->prepare($name_check_query);
        $name_check_stmt->execute([$name, $division['dep_id'], $id]);
        
        if ($name_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division name already exists in this department']);
            exit;
        }
        
        // Update division
        $query = "UPDATE divisions SET name = ?, updated_at = NOW() WHERE div_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$name, $id]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Division updated successfully',
            'division' => [
                'id' => $id,
                'name' => $name,
                'department_id' => $division['dep_id'],
                'department_name' => $division['department_name']
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
