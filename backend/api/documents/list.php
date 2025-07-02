<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $auth = new Auth();
    $user = $auth->authenticate();
    
    $database = new Database();
    $db = $database->getConnection();
    
    $division_id = isset($_GET['division_id']) ? $_GET['division_id'] : '';
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    
    try {
        $query = "SELECT d.doc_id, d.title, d.type, d.file_name, d.file_size, d.uploaded_at, 
                         v.name as division_name, d.division_id, ss.name as uploaded_by_name
                  FROM documents d
                  JOIN divisions v ON d.division_id = v.division_id
                  LEFT JOIN subject_staff ss ON d.uploaded_by = ss.sub_id
                  WHERE d.is_active = 1";
        
        $params = [];
        
        if ($division_id) {
            $query .= " AND d.division_id = ?";
            $params[] = $division_id;
        }
        
        if ($type) {
            $query .= " AND d.type = ?";
            $params[] = $type;
        }
        
        // Filter based on user role
        if ($user['role'] === 'Subject_Staff') {
            // Only show documents from assigned divisions
            $div_query = "SELECT division_id FROM subject_staff_divisions WHERE sub_id = ?";
            $div_stmt = $db->prepare($div_query);
            $div_stmt->execute([$user['user_id']]);
            $assigned_divs = $div_stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($assigned_divs)) {
                $placeholders = str_repeat('?,', count($assigned_divs) - 1) . '?';
                $query .= " AND d.division_id IN ($placeholders)";
                $params = array_merge($params, $assigned_divs);
            }
        }
        
        $query .= " ORDER BY d.uploaded_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        $documents = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $documents[] = [
                'id' => $row['doc_id'],
                'title' => $row['title'],
                'type' => $row['type'],
                'filename' => $row['file_name'],
                'file_size' => $row['file_size'],
                'division_id' => $row['division_id'],
                'division' => $row['division_name'],
                'uploaded_by' => $row['uploaded_by_name'],
                'uploaded_at' => $row['uploaded_at']
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'documents' => $documents
        ]);
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
