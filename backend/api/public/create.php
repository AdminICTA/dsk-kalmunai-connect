
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name) && !empty($data->nic) && !empty($data->mobile) && !empty($data->address) && !empty($data->dateOfBirth)) {
        try {
            // Generate unique public ID
            $public_id = 'PUB' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Check if public ID already exists
            $check_query = "SELECT public_id FROM public_users WHERE public_id = :public_id";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(':public_id', $public_id);
            $check_stmt->execute();
            
            // Generate new ID if exists
            while ($check_stmt->rowCount() > 0) {
                $public_id = 'PUB' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $check_stmt->execute();
            }
            
            $query = "INSERT INTO public_users (public_id, name, nic, mobile, address, date_of_birth, created_at) 
                     VALUES (:public_id, :name, :nic, :mobile, :address, :date_of_birth, NOW())";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':public_id', $public_id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':nic', $data->nic);
            $stmt->bindParam(':mobile', $data->mobile);
            $stmt->bindParam(':address', $data->address);
            $stmt->bindParam(':date_of_birth', $data->dateOfBirth);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Public user created successfully',
                    'user' => [
                        'public_id' => $public_id,
                        'name' => $data->name,
                        'nic' => $data->nic,
                        'mobile' => $data->mobile,
                        'address' => $data->address,
                        'dateOfBirth' => $data->dateOfBirth
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create user']);
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
