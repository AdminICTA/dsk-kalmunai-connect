<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $auth = new Auth();
    $user = $auth->authenticate('Subject_Staff');

    $database = new Database();
    $db = $database->getConnection();

    $doc_id = isset($_GET['doc_id']) ? $_GET['doc_id'] : '';
    if (empty($doc_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'doc_id is required']);
        exit;
    }

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

        // Only uploader or staff assigned to the division can delete
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

        // Soft delete document
        $delete_query = "UPDATE documents SET is_active = 0, updated_at = NOW() WHERE doc_id = ?";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->execute([$doc_id]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Document deleted successfully']);
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} 