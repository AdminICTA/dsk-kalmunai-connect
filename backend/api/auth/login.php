
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    $auth = new Auth();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->username) && !empty($data->password) && !empty($data->role)) {
        $username = $data->username;
        $password = $data->password;
        $role = $data->role;
        
        try {
            // Check different user tables based on role
            if ($role === 'Admin' || $role === 'Reception_Staff') {
                $query = "SELECT user_id, name, username, password, role, dep_id, div_id FROM users WHERE username = ? AND role = ? AND is_active = 1";
                $stmt = $db->prepare($query);
                $stmt->execute([$username, $role]);
            } elseif ($role === 'Subject_Staff') {
                $query = "SELECT sub_id as user_id, name, username, password, 'Subject_Staff' as role, dep_id FROM subject_staff WHERE username = ? AND is_active = 1";
                $stmt = $db->prepare($query);
                $stmt->execute([$username]);
            } elseif ($role === 'Public') {
                $query = "SELECT public_id as user_id, name, username, password, 'Public' as role FROM public_users WHERE username = ? AND is_active = 1";
                $stmt = $db->prepare($query);
                $stmt->execute([$username]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid role']);
                exit;
            }
            
            if ($stmt->rowCount() == 1) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (password_verify($password, $row['password'])) {
                    $token = $auth->generateToken([
                        'user_id' => $row['user_id'],
                        'username' => $row['username'],
                        'name' => $row['name'],
                        'role' => $row['role'],
                        'dep_id' => $row['dep_id'] ?? null,
                        'div_id' => $row['div_id'] ?? null
                    ]);
                    
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login successful',
                        'token' => $token,
                        'user' => [
                            'user_id' => $row['user_id'],
                            'username' => $row['username'],
                            'name' => $row['name'],
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
