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
    $required = ['public_id', 'purpose', 'dep_id', 'division_id'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
            exit;
        }
    }
    try {
        // Generate next token for this division/department for today
        $today = date('Y-m-d');
        $token_query = "SELECT MAX(CAST(token_number AS UNSIGNED)) as max_token FROM public_registry WHERE dep_id = ? AND division_id = ? AND visit_date = ?";
        $token_stmt = $db->prepare($token_query);
        $token_stmt->execute([$data['dep_id'], $data['division_id'], $today]);
        $result = $token_stmt->fetch(PDO::FETCH_ASSOC);
        $next_token = ($result['max_token'] ?? 0) + 1;
        $token_number = str_pad($next_token, 3, '0', STR_PAD_LEFT);
        // Insert registry entry
        $query = "INSERT INTO public_registry (public_id, purpose, dep_id, division_id, token_number, visit_date, visit_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURTIME(), 'Waiting', NOW(), NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['public_id'],
            $data['purpose'],
            $data['dep_id'],
            $data['division_id'],
            $token_number,
            $today
        ]);
        $registry_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registry entry created',
            'registry' => [
                'registry_id' => $registry_id,
                'public_id' => $data['public_id'],
                'purpose' => $data['purpose'],
                'dep_id' => $data['dep_id'],
                'division_id' => $data['division_id'],
                'token_number' => $token_number,
                'visit_date' => $today,
                'status' => 'Waiting'
            ]
        ]);
    } catch (PDOException $exception) {
        error_log("Registry create error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
