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
    if (!isset($data['sub_id']) || !isset($data['name']) || empty(trim($data['name'])) || 
        !isset($data['post']) || empty(trim($data['post'])) ||
        !isset($data['dep_id']) || !isset($data['divisions']) ||
        !isset($data['username'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    $sub_id = $data['sub_id'];
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $divisions = $data['divisions'];
    $username = trim($data['username']);
    try {
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE sub_id = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$sub_id]);
        if ($check_stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Subject staff not found']);
            exit;
        }
        $username_check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ? AND sub_id != ? AND is_active = 1";
        $username_check_stmt = $db->prepare($username_check_query);
        $username_check_stmt->execute([$username, $sub_id]);
        if ($username_check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        $db->beginTransaction();
        if (isset($data['password']) && !empty($data['password'])) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $query = "UPDATE subject_staff SET name = ?, post = ?, dep_id = ?, username = ?, password = ?, updated_at = NOW() WHERE sub_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$name, $post, $dep_id, $username, $password, $sub_id]);
        } else {
            $query = "UPDATE subject_staff SET name = ?, post = ?, dep_id = ?, username = ?, updated_at = NOW() WHERE sub_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$name, $post, $dep_id, $username, $sub_id]);
        }
        $delete_query = "DELETE FROM subject_staff_divisions WHERE sub_id = ?";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->execute([$sub_id]);
        $div_query = "INSERT INTO subject_staff_divisions (sub_id, division_id, assigned_at) VALUES (?, ?, NOW())";
        $div_stmt = $db->prepare($div_query);
        foreach ($divisions as $division_id) {
            $div_stmt->execute([$sub_id, $division_id]);
        }
        $db->commit();
        $dept_query = "SELECT name FROM departments WHERE dep_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        $div_names_query = "SELECT name FROM divisions WHERE division_id IN (" . str_repeat('?,', count($divisions) - 1) . "?)";
        $div_names_stmt = $db->prepare($div_names_query);
        $div_names_stmt->execute($divisions);
        $div_names = $div_names_stmt->fetchAll(PDO::FETCH_COLUMN);
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Subject staff updated successfully',
            'staff' => [
                'sub_id' => $sub_id,
                'name' => $name,
                'post' => $post,
                'dep_id' => $dep_id,
                'department' => $dept_name,
                'divisions' => $divisions,
                'divisionNames' => $div_names,
                'username' => $username,
                'is_active' => true
            ]
        ]);
    } catch (PDOException $exception) {
        if ($db->inTransaction()) $db->rollback();
        error_log("Subject staff update error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
