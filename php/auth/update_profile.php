<?php

session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$userId   = $_SESSION['user']['id'];
$newEmail = trim($_POST['email']    ?? '');
$newPass  = trim($_POST['password'] ?? '');

$errors = [];

if (!empty($newEmail) && !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email address.';
}
if (!empty($newPass) && !preg_match('/^(?=.*\d)(?=.*[A-Z]).{8,}$/', $newPass)) {
    $errors['password'] = 'Password needs 8+ chars, 1 uppercase, 1 number.';
}
if (!empty($errors)) {
    json_response(['success' => false, 'errors' => $errors]);
}

$setParts = [];
$types    = '';
$params   = [];

if (!empty($newEmail)) {
    $setParts[] = 'email = ?';
    $types     .= 's';
    $params[]   = $newEmail;
    $_SESSION['user']['email'] = $newEmail;
}
if (!empty($newPass)) {
    $hashed     = password_hash($newPass, PASSWORD_BCRYPT);
    $setParts[] = 'password = ?';
    $types     .= 's';
    $params[]   = $hashed;
}

if (empty($setParts)) {
    json_response(['success' => false, 'error' => 'Nothing to update.']);
}

$types   .= 'i';
$params[] = $userId;

$sql  = 'UPDATE users SET ' . implode(', ', $setParts) . ' WHERE id = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    json_response(['success' => true, 'message' => 'Profile updated successfully.']);
} else {
    json_response(['success' => false, 'error' => 'Update failed.'], 500);
}

$stmt->close();
$conn->close();
?>
