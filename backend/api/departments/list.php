
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT dep_id, name FROM departments WHERE status = 'active' ORDER BY dep_id";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $departments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $departments[] = [
                'id' => $row['dep_id'],
                'name' => $row['name']
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'departments' => $departments
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
