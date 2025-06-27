
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->username) && !empty($data->password) && !empty($data->role)) {
        $username = $data->username;
        $password = $data->password;
        $role = $data->role;
        
        try {
            $query = "SELECT user_id, username, password_hash, role, status FROM users WHERE username = :username AND role = :role AND status = 'active'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':role', $role);
            $stmt->execute();
            
            if ($stmt->rowCount() == 1) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (password_verify($password, $row['password_hash'])) {
                    // Generate JWT token (simplified version)
                    $token = base64_encode(json_encode([
                        'user_id' => $row['user_id'],
                        'username' => $row['username'],
                        'role' => $row['role'],
                        'exp' => time() + (24 * 60 * 60) // 24 hours
                    ]));
                    
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login successful',
                        'token' => $token,
                        'user' => [
                            'user_id' => $row['user_id'],
                            'username' => $row['username'],
                            'role' => $row['role']
                        ]
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'User not found']);
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
