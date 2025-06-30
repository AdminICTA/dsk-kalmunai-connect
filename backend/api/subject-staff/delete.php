
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get subject staff ID from URL parameter
    $sub_id = isset($_GET['sub_id']) ? $_GET['sub_id'] : '';
    
    if (empty($sub_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Subject staff ID is required']);
        exit;
    }
    
    try {
        // Check if subject staff exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE sub_id = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$sub_id]);
        
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Subject staff not found']);
            exit;
        }
        
        // Begin transaction
        $db->beginTransaction();
        
        // Soft delete - set is_active to 0
        $query = "UPDATE subject_staff SET is_active = 0, updated_at = NOW() WHERE sub_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$sub_id]);
        
        // Delete division assignments
        $delete_query = "DELETE FROM subject_staff_divisions WHERE sub_id = ?";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->execute([$sub_id]);
        
        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Subject staff deleted successfully'
        ]);
    } catch (PDOException $exception) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
