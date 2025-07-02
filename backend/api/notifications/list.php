<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    $where = [];
    $params = [];
    if (isset($_GET['recipient_type'])) {
        $where[] = 'recipient_type = ?';
        $params[] = $_GET['recipient_type'];
    }
    if (isset($_GET['recipient_id'])) {
        $where[] = 'recipient_id = ?';
        $params[] = $_GET['recipient_id'];
    }
    if (isset($_GET['status'])) {
        $where[] = 'status = ?';
        $params[] = $_GET['status'];
    }
    $where_sql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
    $query = "SELECT notification_id, sender_id, sender_type, recipient_id, recipient_type, title, message, type, status, created_at, updated_at FROM notifications $where_sql ORDER BY created_at DESC";
    try {
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['success' => true, 'notifications' => $notifications]);
    } catch (PDOException $exception) {
        error_log("Notification list error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 