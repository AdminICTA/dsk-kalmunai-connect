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
    if (!isset($data['notification_id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'notification_id and status are required']);
        exit;
    }
    try {
        $query = "UPDATE notifications SET status = ?, updated_at = NOW() WHERE notification_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data['status'], $data['notification_id']]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Notification not found or no changes made']);
            exit;
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Notification status updated']);
    } catch (PDOException $exception) {
        error_log("Notification update error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 