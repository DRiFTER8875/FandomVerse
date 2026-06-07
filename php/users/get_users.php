<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_admin();

$result = $conn->query(
    'SELECT id, first_name AS firstName, last_name AS lastName,
            username, email, role,
            DATE_FORMAT(created_at, "%d %b %Y") AS joinedDate
     FROM users
     ORDER BY created_at DESC'
);

if (!$result) {
    json_response(['success' => false, 'error' => 'Failed to fetch users.'], 500);
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

json_response(['success' => true, 'users' => $users]);
$conn->close();
?>