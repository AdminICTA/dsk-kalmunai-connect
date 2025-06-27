
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : '';
    
    try {
        if ($department_id) {
            $query = "SELECT d.division_id, d.division_name, d.department_id, dept.department_name 
                     FROM divisions d 
                     JOIN departments dept ON d.department_id = dept.department_id 
                     WHERE d.department_id = ? AND d.status = 'active' AND dept.status = 'active'
                     ORDER BY d.division_name";
            $stmt = $db->prepare($query);
            $stmt->execute([$department_id]);
        } else {
            $query = "SELECT d.division_id, d.division_name, d.department_id, dept.department_name 
                     FROM divisions d 
                     JOIN departments dept ON d.department_id = dept.department_id 
                     WHERE d.status = 'active' AND dept.status = 'active'
                     ORDER BY d.division_name";
            $stmt = $db->prepare($query);
            $stmt->execute();
        }
        
        $divisions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $divisions[] = [
                'id' => $row['division_id'],
                'name' => $row['division_name'],
                'department_id' => $row['department_id'],
                'department_name' => $row['department_name'],
                'status' => 'active'
            ];
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
