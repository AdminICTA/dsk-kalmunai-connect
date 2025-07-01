
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : '';
    
    try {
        if ($department_id) {
            $query = "SELECT d.division_id, d.name as division_name, d.dep_id, dept.name as department_name 
                     FROM divisions d 
                     LEFT JOIN departments dept ON d.dep_id = dept.dep_id 
                     WHERE d.dep_id = ? AND d.status = 'active'
                     ORDER BY d.name";
            $stmt = $db->prepare($query);
            $stmt->execute([$department_id]);
        } else {
            $query = "SELECT d.division_id, d.name as division_name, d.dep_id, dept.name as department_name 
                     FROM divisions d 
                     LEFT JOIN departments dept ON d.dep_id = dept.dep_id 
                     WHERE d.status = 'active'
                     ORDER BY dept.name, d.name";
            $stmt = $db->prepare($query);
            $stmt->execute();
        }
        
        $divisions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $divisions[] = [
                'id' => $row['division_id'],
                'name' => $row['division_name'],
                'department_id' => $row['dep_id'],
                'department_name' => $row['department_name'] ?? 'Unknown Department',
                'status' => 'active'
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'divisions' => $divisions
        ]);
    } catch (PDOException $exception) {
        error_log("Divisions list error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
