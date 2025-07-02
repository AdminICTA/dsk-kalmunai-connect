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
    if (!isset($data['registry_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'registry_id is required']);
        exit;
    }
    $fields = ['status', 'served_by', 'completed_at'];
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
    $params[] = $data['registry_id'];
    try {
        $query = "UPDATE public_registry SET ".implode(", ", $updates).", updated_at = NOW() WHERE registry_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Registry entry not found or no changes made']);
            exit;
        }
        $select = $db->prepare("SELECT * FROM public_registry WHERE registry_id = ?");
        $select->execute([$data['registry_id']]);
        $entry = $select->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['success' => true, 'entry' => $entry]);
    } catch (PDOException $exception) {
        error_log("Registry update error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 