
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : '';
    
    try {
        if (!empty($department_id)) {
            // Get divisions for specific department
            $query = "SELECT d.div_id, d.name, d.dep_id, dept.department_name 
                      FROM divisions d 
                      JOIN departments dept ON d.dep_id = dept.department_id 
                      WHERE d.dep_id = ? AND d.status = 'active' 
                      ORDER BY d.name";
            $stmt = $db->prepare($query);
            $stmt->execute([$department_id]);
        } else {
            // Get all divisions
            $query = "SELECT d.div_id, d.name, d.dep_id, dept.department_name 
                      FROM divisions d 
                      JOIN departments dept ON d.dep_id = dept.department_id 
                      WHERE d.status = 'active' 
                      ORDER BY dept.department_name, d.name";
            $stmt = $db->prepare($query);
            $stmt->execute();
        }
        
        $divisions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $divisions[] = [
                'id' => $row['div_id'],
                'name' => $row['name'],
                'department_id' => $row['dep_id'],
                'department_name' => $row['department_name']
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
