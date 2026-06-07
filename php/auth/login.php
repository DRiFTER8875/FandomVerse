<?php

session_start();
header('Content-Type: application/json');
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    json_response(['success' => false, 'error' => 'Username and password are required.']);
}

$stmt = $conn->prepare('SELECT id, first_name, last_name, username, email, password, role FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    json_response(['success' => false, 'error' => 'Invalid username or password.']);
}

// verify password

$passwordValid = false;

if (password_verify($password, $user['password'])) {
    $passwordValid = true;
} elseif ($user['role'] === 'admin' && $user['password'] === $password) {
    
    // update password hash
    $newHash = password_hash($password, PASSWORD_BCRYPT);
    $upd = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
    $upd->bind_param('si', $newHash, $user['id']);
    $upd->execute();
    $upd->close();
    $passwordValid = true;
}

if (!$passwordValid) {
    json_response(['success' => false, 'error' => 'Invalid username or password.']);
}

$_SESSION['user'] = [
    'id'       => $user['id'],
    'name'     => $user['first_name'],
    'username' => $user['username'],
    'email'    => $user['email'],
    'role'     => $user['role'],
];

$redirectTo = ($user['role'] === 'admin') ? 'admin_dashboard.html' : 'index.html';

json_response([
    'success'    => true,
    'user'       => $_SESSION['user'],
    'redirectTo' => $redirectTo
]);

$conn->close();
?>
