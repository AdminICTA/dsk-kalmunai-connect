
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT 
                    d.department_name,
                    div.division_name,
                    pr.token_number,
                    pr.status,
                    pr.created_at
                  FROM public_registry pr
                  JOIN departments d ON pr.department_id = d.department_id
                  JOIN divisions div ON pr.division_id = div.division_id
                  WHERE pr.status IN ('waiting', 'processing')
                  ORDER BY d.department_name, div.division_name, pr.created_at";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $tokens = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tokens[] = [
                'department' => $row['department_name'],
                'division' => $row['division_name'],
                'token_number' => $row['token_number'],
                'status' => $row['status'],
                'created_at' => $row['created_at']
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'tokens' => $tokens
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
