<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'fandomverse_db');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

$conn->set_charset('utf8mb4');

// send response
function json_response($data, $status = 200)
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// require admin
function require_admin()
{
    if (session_status() === PHP_SESSION_NONE)
        session_start();
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        json_response(['success' => false, 'error' => 'Unauthorized. Admin access required.'], 403);
    }
}

// require login
function require_login()
{
    if (session_status() === PHP_SESSION_NONE)
        session_start();
    if (!isset($_SESSION['user'])) {
        json_response(['success' => false, 'error' => 'Unauthorized. Please log in.'], 401);
    }
}
?>