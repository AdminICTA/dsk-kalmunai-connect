
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
<<<<<<< HEAD
        $query = "SELECT s.sub_id, s.name, s.post, s.department_id, d.department_name, s.username
                  FROM subject_staff s
                  JOIN departments d ON s.department_id = d.department_id 
                  WHERE s.is_active = 1
                  ORDER BY s.created_at DESC";
=======
        $query = "SELECT ss.sub_id, ss.name, ss.post, ss.dep_id, ss.username, ss.is_active,
                         d.department_name,
                         GROUP_CONCAT(div.division_id) as division_ids,
                         GROUP_CONCAT(div.division_name) as division_names
                  FROM subject_staff ss
                  JOIN departments d ON ss.dep_id = d.department_id
                  LEFT JOIN subject_staff_divisions ssd ON ss.sub_id = ssd.sub_id
                  LEFT JOIN divisions div ON ssd.div_id = div.division_id AND div.status = 'active'
                  WHERE ss.is_active = 1 AND d.status = 'active'
                  GROUP BY ss.sub_id
                  ORDER BY ss.name";
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $staff = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
<<<<<<< HEAD
            // Get assigned divisions for this staff member
            $div_query = "SELECT div.division_id, div.division_name 
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
            
=======
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
            $staff[] = [
                'sub_id' => $row['sub_id'],
                'name' => $row['name'],
                'post' => $row['post'],
<<<<<<< HEAD
                'dep_id' => $row['department_id'],
                'department' => $row['department_name'],
                'divisions' => $divisions,
                'divisionNames' => $divisionNames,
                'username' => $row['username'],
                'password' => '****' // Don't expose actual password
=======
                'dep_id' => $row['dep_id'],
                'department' => $row['department_name'],
                'divisions' => $row['division_ids'] ? explode(',', $row['division_ids']) : [],
                'divisionNames' => $row['division_names'] ? explode(',', $row['division_names']) : [],
                'username' => $row['username'],
                'is_active' => $row['is_active']
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
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
