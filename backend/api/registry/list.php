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
    if (isset($_GET['date'])) {
        $where[] = 'pr.visit_date = ?';
        $params[] = $_GET['date'];
    }
    if (isset($_GET['status'])) {
        $where[] = 'pr.status = ?';
        $params[] = $_GET['status'];
    }
    if (isset($_GET['public_id'])) {
        $where[] = 'pr.public_id = ?';
        $params[] = $_GET['public_id'];
    }
    $where_sql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
    $query = "SELECT pr.registry_id, pr.token_number, pr.purpose, pr.status, pr.visit_date, pr.visit_time, pr.completed_at, pr.created_at, pr.updated_at, pu.name as public_name, pu.nic_number, d.name as department_name, dv.name as division_name, ss.name as served_by_name FROM public_registry pr JOIN public_users pu ON pr.public_id = pu.public_id JOIN departments d ON pr.dep_id = d.dep_id JOIN divisions dv ON pr.division_id = dv.division_id LEFT JOIN subject_staff ss ON pr.served_by = ss.sub_id $where_sql ORDER BY pr.visit_date DESC, pr.token_number ASC";
    try {
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['success' => true, 'entries' => $entries]);
    } catch (PDOException $exception) {
        error_log("Registry list error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 