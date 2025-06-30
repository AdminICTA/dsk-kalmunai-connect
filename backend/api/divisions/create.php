
<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
<<<<<<< HEAD
    if (!isset($data['name']) || empty(trim($data['name'])) || !isset($data['dep_id']) || empty($data['dep_id'])) {
=======
    if (!isset($data['name']) || empty(trim($data['name'])) || !isset($data['department_id'])) {
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Division name and department ID are required']);
        exit;
    }
    
    $name = trim($data['name']);
<<<<<<< HEAD
    $dep_id = $data['dep_id'];
    
    try {
        // Check if department exists
        $dept_check_query = "SELECT department_name FROM departments WHERE department_id = ? AND status = 'active'";
        $dept_check_stmt = $db->prepare($dept_check_query);
        $dept_check_stmt->execute([$dep_id]);
        $department = $dept_check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$department) {
=======
    $department_id = $data['department_id'];
    
    try {
        // Check if department exists
        $dept_check_query = "SELECT COUNT(*) FROM departments WHERE department_id = ? AND status = 'active'";
        $dept_check_stmt = $db->prepare($dept_check_query);
        $dept_check_stmt->execute([$department_id]);
        
        if ($dept_check_stmt->fetchColumn() == 0) {
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit;
        }
        
        // Check if division already exists in this department
        $check_query = "SELECT COUNT(*) FROM divisions WHERE division_name = ? AND department_id = ? AND status = 'active'";
        $check_stmt = $db->prepare($check_query);
<<<<<<< HEAD
        $check_stmt->execute([$name, $dep_id]);
=======
        $check_stmt->execute([$name, $department_id]);
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        
        if ($check_stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Division already exists in this department']);
            exit;
        }
        
        // Insert new division
        $query = "INSERT INTO divisions (division_name, department_id, status, created_at) VALUES (?, ?, 'active', NOW())";
        $stmt = $db->prepare($query);
<<<<<<< HEAD
        $stmt->execute([$name, $dep_id]);
        
        $division_id = $db->lastInsertId();
        
=======
        $stmt->execute([$name, $department_id]);
        
        $division_id = $db->lastInsertId();
        
        // Get department name for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$department_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Division created successfully',
            'division' => [
                'id' => $division_id,
                'name' => $name,
<<<<<<< HEAD
                'department_id' => $dep_id,
                'department_name' => $department['department_name']
=======
                'department_id' => $department_id,
                'department_name' => $dept_name,
                'status' => 'active'
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
            ]
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
