<?php
// ============================================================
// FandomVerse — Clear Cart (Logged-in user only)
// ============================================================
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_login();

$userId = $_SESSION['user']['id'];

$stmt = $conn->prepare('DELETE FROM cart WHERE user_id = ?');
$stmt->bind_param('i', $userId);

if ($stmt->execute()) {
    json_response(['success' => true, 'message' => 'Cart cleared.']);
} else {
    json_response(['success' => false, 'error' => 'Failed to clear cart.'], 500);
}

$stmt->close();
$conn->close();
?>
