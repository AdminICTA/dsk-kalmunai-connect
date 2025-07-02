<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $database = new Database();
    $db = $database->getConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!isset($data['public_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'public_id is required']);
        exit;
    }
    $fields = ['name', 'nic_number', 'phone', 'address', 'date_of_birth'];
    $updates = [];
    $params = [];
    foreach ($fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }
    $params[] = $data['public_id'];
    try {
        $query = "UPDATE public_users SET ".implode(", ", $updates).", updated_at = NOW() WHERE public_id = ? AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found or no changes made']);
            exit;
        }
        $select = $db->prepare("SELECT public_id, name, nic_number, phone, address, date_of_birth, username, is_active, created_at FROM public_users WHERE public_id = ?");
        $select->execute([$data['public_id']]);
        $user = $select->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['success' => true, 'user' => $user]);
    } catch (PDOException $exception) {
        error_log("Public user update error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 