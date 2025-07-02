<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $auth = new Auth();
    $user = $auth->authenticate('Subject_Staff');

    $database = new Database();
    $db = $database->getConnection();

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!isset($data['doc_id']) || !isset($data['title']) || !isset($data['type']) || !isset($data['division_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'doc_id, title, type, and division_id are required']);
        exit;
    }

    $doc_id = $data['doc_id'];
    $title = trim($data['title']);
    $type = trim($data['type']);
    $division_id = $data['division_id'];

    try {
        // Check if document exists and user has permission
        $query = "SELECT uploaded_by, division_id FROM documents WHERE doc_id = ? AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->execute([$doc_id]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doc) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Document not found']);
            exit;
        }

        // Only uploader or staff assigned to the division can update
        $allowed = false;
        if ($doc['uploaded_by'] === $user['user_id']) {
            $allowed = true;
        } else {
            $div_query = "SELECT COUNT(*) FROM subject_staff_divisions WHERE sub_id = ? AND division_id = ?";
            $div_stmt = $db->prepare($div_query);
            $div_stmt->execute([$user['user_id'], $doc['division_id']]);
            if ($div_stmt->fetchColumn() > 0) {
                $allowed = true;
            }
        }
        if (!$allowed) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Permission denied']);
            exit;
        }

        // Update document
        $update_query = "UPDATE documents SET title = ?, type = ?, division_id = ?, updated_at = NOW() WHERE doc_id = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->execute([$title, $type, $division_id, $doc_id]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Document updated successfully']);
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} 