
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
    $required_fields = ['name', 'post', 'dep_id', 'divisions', 'username', 'password'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    
    if (!is_array($data['divisions']) || empty($data['divisions'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one division must be selected']);
        exit;
    }
    
    try {
        // Start transaction
        $db->beginTransaction();
        
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data['username']]);
        
        if ($check_stmt->fetchColumn() > 0) {
            $db->rollBack();
=======
    if (!isset($data['name']) || empty(trim($data['name'])) || 
        !isset($data['post']) || empty(trim($data['post'])) ||
        !isset($data['dep_id']) || !isset($data['divisions']) ||
        !isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    $name = trim($data['name']);
    $post = trim($data['post']);
    $dep_id = $data['dep_id'];
    $divisions = $data['divisions'];
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    try {
        // Check if username already exists
        $check_query = "SELECT COUNT(*) FROM subject_staff WHERE username = ? AND is_active = 1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$username]);
        
        if ($check_stmt->fetchColumn() > 0) {
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }
        
<<<<<<< HEAD
        // Generate sub_id
        $id_query = "SELECT MAX(CAST(SUBSTRING(sub_id, 4) AS UNSIGNED)) as max_id FROM subject_staff WHERE sub_id LIKE 'SUB%'";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $result = $id_stmt->fetch(PDO::FETCH_ASSOC);
        $next_num = ($result['max_id'] ?? 0) + 1;
        $sub_id = 'SUB' . str_pad($next_num, 3, '0', STR_PAD_LEFT);
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert subject staff
        $query = "INSERT INTO subject_staff (sub_id, name, post, department_id, username, password, is_active, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $sub_id,
            $data['name'],
            $data['post'],
            $data['dep_id'],
            $data['username'],
            $hashed_password
        ]);
        
        // Insert division assignments
        $div_query = "INSERT INTO subject_staff_divisions (sub_id, division_id) VALUES (?, ?)";
        $div_stmt = $db->prepare($div_query);
        
        foreach ($data['divisions'] as $division_id) {
            $div_stmt->execute([$sub_id, $division_id]);
        }
        
        // Get department name
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$data['dep_id']]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $db->commit();
=======
        // Generate new subject staff ID
        $id_query = "SELECT COUNT(*) FROM subject_staff";
        $id_stmt = $db->prepare($id_query);
        $id_stmt->execute();
        $count = $id_stmt->fetchColumn();
        $sub_id = 'SUB' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        
        // Begin transaction
        $db->beginTransaction();
        
        // Insert new subject staff
        $query = "INSERT INTO subject_staff (sub_id, name, post, dep_id, username, password, is_active, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$sub_id, $name, $post, $dep_id, $username, $password]);
        
        // Insert division assignments
        $div_query = "INSERT INTO subject_staff_divisions (sub_id, div_id, assigned_at) VALUES (?, ?, NOW())";
        $div_stmt = $db->prepare($div_query);
        
        foreach ($divisions as $div_id) {
            $div_stmt->execute([$sub_id, $div_id]);
        }
        
        // Commit transaction
        $db->commit();
        
        // Get department name and division names for response
        $dept_query = "SELECT department_name FROM departments WHERE department_id = ?";
        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([$dep_id]);
        $dept_name = $dept_stmt->fetchColumn();
        
        $div_names_query = "SELECT division_name FROM divisions WHERE division_id IN (" . str_repeat('?,', count($divisions) - 1) . "?)";
        $div_names_stmt = $db->prepare($div_names_query);
        $div_names_stmt->execute($divisions);
        $div_names = $div_names_stmt->fetchAll(PDO::FETCH_COLUMN);
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Subject staff created successfully',
            'staff' => [
                'sub_id' => $sub_id,
<<<<<<< HEAD
                'name' => $data['name'],
                'post' => $data['post'],
                'dep_id' => $data['dep_id'],
                'department' => $dept_name,
                'divisions' => $data['divisions'],
                'username' => $data['username']
            ]
        ]);
    } catch (PDOException $exception) {
        $db->rollBack();
=======
                'name' => $name,
                'post' => $post,
                'dep_id' => $dep_id,
                'department' => $dept_name,
                'divisions' => $divisions,
                'divisionNames' => $div_names,
                'username' => $username,
                'is_active' => true
            ]
        ]);
    } catch (PDOException $exception) {
        $db->rollback();
>>>>>>> 7827c2f1d42e7c2b03be2e9489d1546c3cd5ffb3
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
