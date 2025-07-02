<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $required = ['sender_id', 'sender_type', 'recipient_type', 'title', 'message'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    $recipient_id = isset($data['recipient_id']) ? $data['recipient_id'] : null;
    $recipient_type = $data['recipient_type']; // 'Public', 'Group', 'All'
    $type = isset($data['type']) ? $data['type'] : 'Info';
    $status = isset($data['status']) ? $data['status'] : 'Pending';
    try {
        $query = "INSERT INTO notifications (sender_id, sender_type, recipient_id, recipient_type, title, message, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['sender_id'],
            $data['sender_type'],
            $recipient_id,
            $recipient_type,
            $data['title'],
            $data['message'],
            $type,
            $status
        ]);
        $notification_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'notification' => [
                'notification_id' => $notification_id,
                'sender_id' => $data['sender_id'],
                'sender_type' => $data['sender_type'],
                'recipient_id' => $recipient_id,
                'recipient_type' => $recipient_type,
                'title' => $data['title'],
                'message' => $data['message'],
                'type' => $type,
                'status' => $status
            ]
        ]);
    } catch (PDOException $exception) {
        error_log("Notification create error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 