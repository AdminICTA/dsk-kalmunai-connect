<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $database = new Database();
    $db = $database->getConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!isset($data['public_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'public_id is required']);
        exit;
    }
    try {
        $query = "UPDATE public_users SET is_active = 0, updated_at = NOW() WHERE public_id = ? AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->execute([$data['public_id']]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found or already deleted']);
            exit;
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } catch (PDOException $exception) {
        error_log("Public user delete error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 