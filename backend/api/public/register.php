<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $auth = new Auth();
    $user = $auth->authenticate('Reception_Staff');
    $database = new Database();
    $db = $database->getConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $required = ['name', 'nic_number', 'phone', 'address', 'date_of_birth'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
            exit;
        }
    }
    try {
        $check_query = "SELECT COUNT(*) FROM public_users WHERE nic_number = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data['nic_number']]);
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'NIC number already registered']);
            exit;
        }
        $id_query = "SELECT MAX(CAST(SUBSTRING(public_id, 4) AS UNSIGNED)) as max_id FROM public_users WHERE public_id LIKE 'PUB%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $public_id = 'PUB' . str_pad($next_num, 4, '0', STR_PAD_LEFT);
        $qr_data = json_encode([
            'public_id' => $public_id,
            'name' => $data['name'],
            'nic' => $data['nic_number'],
            'issued_date' => date('Y-m-d')
        ]);
        $query = "INSERT INTO public_users (public_id, name, nic_number, phone, address, date_of_birth, qr_code_data, username, password, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $public_id,
            $data['name'],
            $data['nic_number'],
            $data['phone'],
            $data['address'],
            $data['date_of_birth'],
            $qr_data,
            $data['nic_number'], // Use NIC as username
            password_hash($data['nic_number'], PASSWORD_DEFAULT) // Use NIC as default password
        ]);
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Public user registered successfully',
            'user' => [
                'public_id' => $public_id,
                'name' => $data['name'],
                'nic_number' => $data['nic_number'],
                'qr_code_data' => $qr_data
            ]
        ]);
    } catch (PDOException $exception) {
        error_log("Public user register error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
