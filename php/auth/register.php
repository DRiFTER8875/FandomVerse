<?php

session_start();
header('Content-Type: application/json');
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$firstName  = trim($_POST['firstName']  ?? '');
$lastName   = trim($_POST['lastName']   ?? '');
$username   = trim($_POST['username']   ?? '');
$email      = trim($_POST['email']      ?? '');
$password   = trim($_POST['password']   ?? '');
$confirm    = trim($_POST['confirmPassword'] ?? '');
$address    = trim($_POST['address']    ?? '');
$province   = trim($_POST['province']   ?? '');
$city       = trim($_POST['city']       ?? '');
$postalCode = trim($_POST['postalCode'] ?? '');
$phone      = trim($_POST['phone']      ?? '');

$errors = [];

if (empty($firstName) || empty($lastName)) {
    $errors['name'] = 'First and last name are required.';
}

if (strlen($username) < 5 || strlen($username) > 15) {
    $errors['username'] = 'Username must be 5–15 characters.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email address.';
}

if (!preg_match('/^(?=.*\d)(?=.*[A-Z]).{8,}$/', $password)) {
    $errors['password'] = 'Password needs 8+ chars, 1 uppercase, 1 number.';
}

if ($password !== $confirm) {
    $errors['confirmPassword'] = "Passwords don't match.";
}

if (!empty($errors)) {
    json_response(['success' => false, 'errors' => $errors]);
}

// check uniqueness
$stmt = $conn->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
$stmt->bind_param('ss', $username, $email);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    
    $chkStmt = $conn->prepare('SELECT username, email FROM users WHERE username = ? OR email = ?');
    $chkStmt->bind_param('ss', $username, $email);
    $chkStmt->execute();
    $chkResult = $chkStmt->get_result();
    while ($existing = $chkResult->fetch_assoc()) {
        if ($existing['username'] === $username) $errors['username'] = 'Username already taken.';
        if ($existing['email']    === $email)    $errors['email']    = 'Email already registered.';
    }
    json_response(['success' => false, 'errors' => $errors]);
}
$stmt->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);

$insert = $conn->prepare(
    'INSERT INTO users (first_name, last_name, username, email, password, role, address, province, city, postal_code, phone)
     VALUES (?, ?, ?, ?, ?, "customer", ?, ?, ?, ?, ?)'
);
$insert->bind_param(
    'ssssssssss',
    $firstName, $lastName, $username, $email, $hashed,
    $address, $province, $city, $postalCode, $phone
);

if ($insert->execute()) {
    json_response(['success' => true, 'message' => 'Account created successfully! Please log in.']);
} else {
    json_response(['success' => false, 'error' => 'Registration failed. Please try again.'], 500);
}

$insert->close();
$conn->close();
?>
