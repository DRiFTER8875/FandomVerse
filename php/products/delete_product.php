<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$id = trim($_POST['id'] ?? '');
if (empty($id)) {
    json_response(['success' => false, 'error' => 'Product ID is required.']);
}

$stmt = $conn->prepare('DELETE FROM products WHERE id = ?');
$stmt->bind_param('s', $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows === 0) {
        json_response(['success' => false, 'error' => 'Product not found.']);
    }
    json_response(['success' => true, 'message' => 'Product deleted successfully.']);
} else {
    json_response(['success' => false, 'error' => 'Delete failed.'], 500);
}

$stmt->close();
$conn->close();
?>