
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT ss.sub_id, ss.name, ss.post, ss.department_id, d.department_name, ss.username
                  FROM subject_staff ss
                  JOIN departments d ON ss.department_id = d.department_id
                  WHERE ss.is_active = 1
                  ORDER BY ss.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $staff = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Get divisions for this staff member
            $div_query = "SELECT ssd.division_id, div.division_name 
                          FROM subject_staff_divisions ssd
                          JOIN divisions div ON ssd.division_id = div.division_id
                          WHERE ssd.sub_id = ?";
            $div_stmt = $db->prepare($div_query);
            $div_stmt->execute([$row['sub_id']]);
            
            $divisions = [];
            $divisionNames = [];
            while ($div_row = $div_stmt->fetch(PDO::FETCH_ASSOC)) {
                $divisions[] = $div_row['division_id'];
                $divisionNames[] = $div_row['division_name'];
            }
            
            $staff[] = [
                'sub_id' => $row['sub_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'dep_id' => $row['department_id'],
                'department' => $row['department_name'],
                'divisions' => $divisions,
                'divisionNames' => $divisionNames,
                'username' => $row['username'],
                'password' => '' // Don't return actual password
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'staff' => $staff
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
