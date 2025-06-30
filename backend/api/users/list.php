
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
<<<<<<< HEAD
        $query = "SELECT u.user_id, u.name, u.post, u.role, u.username, u.is_active, 
                         d.department_name, div.division_name
                  FROM users u
                  JOIN departments d ON u.department_id = d.department_id
                  JOIN divisions div ON u.division_id = div.division_id
                  ORDER BY u.created_at DESC";
=======
        $query = "SELECT u.user_id, u.name, u.post, u.dep_id, u.div_id, u.role, u.username, u.is_active,
                         d.department_name, div.division_name
                  FROM users u
                  JOIN departments d ON u.dep_id = d.department_id
                  JOIN divisions div ON u.div_id = div.division_id
                  WHERE u.is_active = 1 AND d.status = 'active' AND div.status = 'active'
                  ORDER BY u.name";
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
<<<<<<< HEAD
                'id' => $row['user_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'role' => $row['role'],
                'username' => $row['username'],
                'is_active' => (bool)$row['is_active'],
                'department' => $row['department_name'],
                'division' => $row['division_name']
=======
                'user_id' => $row['user_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'dep_id' => $row['dep_id'],
                'department' => $row['department_name'],
                'div_id' => $row['div_id'],
                'division' => $row['division_name'],
                'role' => $row['role'],
                'username' => $row['username'],
                'is_active' => $row['is_active']
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'users' => $users
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
