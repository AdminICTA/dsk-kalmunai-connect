
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $auth = new Auth();
    $user = $auth->authenticate('Admin');
    
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        // Get department count
        $dept_query = "SELECT COUNT(*) as count FROM departments";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute();
        $dept_count = $dept_stmt->fetchColumn();
        
        // Get division count
        $div_query = "SELECT COUNT(*) as count FROM divisions";
        $div_stmt = $db->prepare($div_query);
        $div_stmt->execute();
        $div_count = $div_stmt->fetchColumn();
        
        // Get user count
        $user_query = "SELECT COUNT(*) as count FROM users WHERE is_active = 1";
        $user_stmt = $db->prepare($user_query);
        $user_stmt->execute();
        $user_count = $user_stmt->fetchColumn();
        
        // Get subject staff count
        $staff_query = "SELECT COUNT(*) as count FROM subject_staff WHERE is_active = 1";
        $staff_stmt = $db->prepare($staff_query);
        $staff_stmt->execute();
        $staff_count = $staff_stmt->fetchColumn();
        
        // Get public users count
        $public_query = "SELECT COUNT(*) as count FROM public_users WHERE is_active = 1";
        $public_stmt = $db->prepare($public_query);
        $public_stmt->execute();
        $public_count = $public_stmt->fetchColumn();
        
        // Get today's registrations
        $today_query = "SELECT COUNT(*) as count FROM public_registry WHERE DATE(created_at) = CURDATE()";
        $today_stmt = $db->prepare($today_query);
        $today_stmt->execute();
        $today_count = $today_stmt->fetchColumn();
        
        // Get active tokens
        $token_query = "SELECT COUNT(*) as count FROM public_registry WHERE status IN ('Waiting', 'In_Progress')";
        $token_stmt = $db->prepare($token_query);
        $token_stmt->execute();
        $active_tokens = $token_stmt->fetchColumn();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'stats' => [
                'departments' => (int)$dept_count,
                'divisions' => (int)$div_count,
                'users' => (int)$user_count,
                'subject_staff' => (int)$staff_count,
                'public_users' => (int)$public_count,
                'today_registrations' => (int)$today_count,
                'active_tokens' => (int)$active_tokens
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
