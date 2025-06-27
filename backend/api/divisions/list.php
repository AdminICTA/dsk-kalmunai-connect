
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : '';
    
    try {
        if ($department_id) {
            $query = "SELECT division_id, division_name FROM divisions WHERE department_id = :department_id AND status = 'active' ORDER BY division_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':department_id', $department_id);
        } else {
            $query = "SELECT division_id, division_name, department_id FROM divisions WHERE status = 'active' ORDER BY division_name";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        
        $divisions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $division = [
                'id' => $row['division_id'],
                'name' => $row['division_name']
            ];
            if (!$department_id) {
                $division['dep_id'] = $row['department_id'];
            }
            $divisions[] = $division;
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'divisions' => $divisions
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
