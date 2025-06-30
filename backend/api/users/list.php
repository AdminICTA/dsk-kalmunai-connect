
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT u.user_id, u.name, u.post, u.role, u.username, u.is_active, 
                         d.department_name, div.division_name
                  FROM users u
                  JOIN departments d ON u.department_id = d.department_id
                  JOIN divisions div ON u.division_id = div.division_id
                  ORDER BY u.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                'id' => $row['user_id'],
                'name' => $row['name'],
                'post' => $row['post'],
                'role' => $row['role'],
                'username' => $row['username'],
                'is_active' => (bool)$row['is_active'],
                'department' => $row['department_name'],
                'division' => $row['division_name']
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
