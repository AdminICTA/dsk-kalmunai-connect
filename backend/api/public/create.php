
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    $required_fields = ['name', 'nic', 'address', 'mobile', 'dateOfBirth'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    
    try {
        // Check if NIC already exists
        $check_query = "SELECT COUNT(*) FROM public_users WHERE nic_number = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data['nic']]);
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'User with this NIC already exists']);
            exit;
        }
        
        // Generate public_id
        $id_query = "SELECT MAX(CAST(SUBSTRING(public_id, 4) AS UNSIGNED)) as max_id FROM public_users WHERE public_id LIKE 'PUB%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $public_id = 'PUB' . str_pad($next_num, 4, '0', STR_PAD_LEFT);
        
        // Insert public user
        $query = "INSERT INTO public_users (public_id, name, nic_number, address, mobile_number, date_of_birth, username, password, is_active, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $public_id,
            $data['name'],
            $data['nic'],
            $data['address'],
            $data['mobile'],
            $data['dateOfBirth'],
            $data['nic'], // Use NIC as username
            password_hash('123456', PASSWORD_DEFAULT) // Default password
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Public user created successfully',
            'user' => [
                'public_id' => $public_id,
                'name' => $data['name'],
                'nic' => $data['nic'],
                'address' => $data['address'],
                'mobile' => $data['mobile'],
                'dateOfBirth' => $data['dateOfBirth']
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
