
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->public_id) && !empty($data->purpose) && !empty($data->department) && !empty($data->division)) {
        try {
            // Generate token number
            $token_prefix = $data->department;
            $token_number = $token_prefix . '-' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
            
            $query = "INSERT INTO public_registry (public_id, purpose, department_id, division_id, token_number, status, created_at) 
                     VALUES (:public_id, :purpose, :department, :division, :token_number, 'waiting', NOW())";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':public_id', $data->public_id);
            $stmt->bindParam(':purpose', $data->purpose);
            $stmt->bindParam(':department', $data->department);
            $stmt->bindParam(':division', $data->division);
            $stmt->bindParam(':token_number', $token_number);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Registry entry created successfully',
                    'token_number' => $token_number
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create registry entry']);
            }
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
