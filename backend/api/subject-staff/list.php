
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
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
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $staff = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $staff[] = [
                'sub_id' => $row['sub_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'dep_id' => $row['dep_id'],
                'department' => $row['department_name'],
                'divisions' => $row['division_ids'] ? explode(',', $row['division_ids']) : [],
                'divisionNames' => $row['division_names'] ? explode(',', $row['division_names']) : [],
                'username' => $row['username'],
                'is_active' => $row['is_active']
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
