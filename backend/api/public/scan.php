
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->public_id)) {
        try {
            $query = "SELECT * FROM public_users WHERE public_id = :public_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':public_id', $data->public_id);
            $stmt->execute();
            
            if ($stmt->rowCount() == 1) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'public_id' => $user['public_id'],
                        'name' => $user['name'],
                        'nic' => $user['nic'],
                        'mobile' => $user['mobile'],
                        'address' => $user['address'],
                        'dateOfBirth' => $user['date_of_birth']
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Public ID is required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
