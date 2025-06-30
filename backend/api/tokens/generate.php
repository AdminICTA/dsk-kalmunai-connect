
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $auth = new Auth();
    $user = $auth->authenticate(); // Any authenticated user can generate tokens
    
    $database = new Database();
    $db = $database->getConnection();
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $required = ['public_id', 'purpose', 'dep_id', 'div_id'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
            exit;
        }
    }
    
    try {
        $db->beginTransaction();
        
        // Get or create token management entry
        $token_query = "SELECT current_token_number, queue_count FROM token_management WHERE dep_id = ? AND div_id = ?";
        $token_stmt = $db->prepare($token_query);
        $token_stmt->execute([$data['dep_id'], $data['div_id']]);
        
        if ($token_stmt->rowCount() == 0) {
            // Create new token management entry
            $create_token = "INSERT INTO token_management (dep_id, div_id, current_token_number, queue_count, status) VALUES (?, ?, 1, 1, 'Active')";
            $create_stmt = $db->prepare($create_token);
            $create_stmt->execute([$data['dep_id'], $data['div_id']]);
            $token_number = "001";
        } else {
            $token_row = $token_stmt->fetch(PDO::FETCH_ASSOC);
            $next_token = $token_row['current_token_number'] + 1;
            $token_number = str_pad($next_token, 3, '0', STR_PAD_LEFT);
            
            // Update token management
            $update_token = "UPDATE token_management SET current_token_number = current_token_number + 1, queue_count = queue_count + 1 WHERE dep_id = ? AND div_id = ?";
            $update_stmt = $db->prepare($update_token);
            $update_stmt->execute([$data['dep_id'], $data['div_id']]);
        }
        
        // Generate full token number
        $full_token = $data['dep_id'] . '-' . $token_number;
        
        // Insert registry entry
        $registry_query = "INSERT INTO public_registry (public_id, purpose, dep_id, div_id, token_number, visit_date, visit_time, status, created_at) VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME(), 'Waiting', NOW())";
        $registry_stmt = $db->prepare($registry_query);
        $registry_stmt->execute([
            $data['public_id'],
            $data['purpose'],
            $data['dep_id'],
            $data['div_id'],
            $full_token
        ]);
        
        $registry_id = $db->lastInsertId();
        
        $db->commit();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Token generated successfully',
            'token' => [
                'registry_id' => $registry_id,
                'token_number' => $full_token,
                'status' => 'Waiting',
                'purpose' => $data['purpose']
            ]
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
