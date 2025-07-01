
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT u.user_id, u.name, u.post, u.dep_id, u.division_id, u.role, u.username, u.is_active,
                         d.name as department_name, div.name as division_name
                  FROM users u
                  LEFT JOIN departments d ON u.dep_id = d.dep_id
                  LEFT JOIN divisions div ON u.division_id = div.division_id
                  WHERE u.is_active = 1 
                  ORDER BY u.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                'user_id' => $row['user_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'dep_id' => $row['dep_id'],
                'department' => $row['department_name'] ?? 'Unknown Department',
                'div_id' => $row['division_id'],
                'division' => $row['division_name'] ?? 'Unknown Division',
                'role' => $row['role'],
                'username' => $row['username'],
                'is_active' => (bool)$row['is_active']
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'users' => $users
        ]);
    } catch (PDOException $exception) {
        error_log("Users list error: " . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
