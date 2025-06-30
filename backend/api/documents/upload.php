
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $auth = new Auth();
    $user = $auth->authenticate('Subject_Staff');
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Validate required fields
    if (!isset($_POST['title']) || !isset($_POST['type']) || !isset($_POST['div_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title, type, and division ID are required']);
        exit;
    }
    
    if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
        exit;
    }
    
    $allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    $file_type = $_FILES['document']['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only PDF, Word, and Excel files are allowed']);
        exit;
    }
    
    try {
        // Generate document ID
        $doc_id = 'DOC' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Create upload directory if it doesn't exist
        $upload_dir = '../../uploads/documents/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['document']['name'], PATHINFO_EXTENSION);
        $filename = $doc_id . '_' . time() . '.' . $file_extension;
        $file_path = $upload_dir . $filename;
        
        if (move_uploaded_file($_FILES['document']['tmp_name'], $file_path)) {
            // Insert document record
            $query = "INSERT INTO documents (doc_id, title, type, div_id, file_path, file_name, file_size, mime_type, uploaded_by, uploaded_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)";
            $stmt = $db->prepare($query);
            $stmt->execute([
                $doc_id,
                $_POST['title'],
                $_POST['type'],
                $_POST['div_id'],
                $file_path,
                $_FILES['document']['name'],
                $_FILES['document']['size'],
                $file_type,
                $user['user_id']
            ]);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => [
                    'id' => $doc_id,
                    'title' => $_POST['title'],
                    'type' => $_POST['type'],
                    'filename' => $_FILES['document']['name']
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
        }
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
