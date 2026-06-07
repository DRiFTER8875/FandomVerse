<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$userId = $_SESSION['user']['id'];
$productId = trim($_POST['productId'] ?? '');
$quantity = max(1, (int) ($_POST['quantity'] ?? 1));
$size = trim($_POST['size'] ?? 'Standard');
$material = trim($_POST['material'] ?? 'Standard');
$delivery = trim($_POST['delivery'] ?? 'Standard Delivery');

if (empty($productId)) {
    json_response(['success' => false, 'error' => 'Product ID is required.']);
}

// save cart item
$stmt = $conn->prepare(
    'INSERT INTO cart (user_id, product_id, quantity, size, material, delivery)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)'
);
$stmt->bind_param('isisss', $userId, $productId, $quantity, $size, $material, $delivery);

if ($stmt->execute()) {
    json_response(['success' => true, 'message' => 'Cart updated.']);
} else {
    json_response(['success' => false, 'error' => 'Failed to update cart.'], 500);
}

$stmt->close();
$conn->close();
?>