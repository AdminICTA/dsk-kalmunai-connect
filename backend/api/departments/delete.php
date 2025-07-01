
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get department ID from URL parameter
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Department ID is required']);
        exit;
    }
    
    try {
        // Start transaction
        $db->beginTransaction();
        
        // Check if department exists and get its current status
        $check_query = "SELECT department_id, department_name, status FROM departments WHERE department_id = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$id]);
        $department = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$department) {
            $db->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if department has active divisions
        $div_check_query = "SELECT COUNT(*) as count FROM divisions WHERE department_id = ? AND status = 'active'";
        $div_check_stmt = $db->prepare($div_check_query);
        $div_check_stmt->execute([$id]);
        $div_count = $div_check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($div_count['count'] > 0) {
            $db->rollback();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete department with active divisions']);
            exit;
        }
        
        // Soft delete - set status to inactive
        $delete_query = "UPDATE departments SET status = 'inactive', updated_at = NOW() WHERE department_id = ?";
        $delete_stmt = $db->prepare($delete_query);
        $result = $delete_stmt->execute([$id]);
        
        if (!$result) {
            $db->rollback();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete department']);
            exit;
        }
        
        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);
        
    } catch (PDOException $exception) {
        $db->rollback();
        error_log("Department delete error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
