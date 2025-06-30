
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division ID is required']);
        exit;
    }
    
    try {
        // Check if division exists
        $check_query = "SELECT COUNT(*) FROM divisions WHERE div_id = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Division not found']);
            exit;
        }
        
        // Soft delete - set status to inactive
        $query = "UPDATE divisions SET status = 'inactive', updated_at = NOW() WHERE div_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Division deleted successfully'
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
