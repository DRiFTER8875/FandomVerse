<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    json_response(['success' => false, 'error' => 'Valid user ID is required.']);
}

// prevent self deletion
if ($id === (int) $_SESSION['user']['id']) {
    json_response(['success' => false, 'error' => 'You cannot delete your own account.']);
}

$stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows === 0) {
        json_response(['success' => false, 'error' => 'User not found.']);
    }
    json_response(['success' => true, 'message' => 'User deleted successfully.']);
} else {
    json_response(['success' => false, 'error' => 'Delete failed.'], 500);
}

$stmt->close();
$conn->close();
?>