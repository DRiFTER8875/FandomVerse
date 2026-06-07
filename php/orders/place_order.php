<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$address = trim($_POST['address'] ?? '');
$city = trim($_POST['city'] ?? '');
$itemsJson = trim($_POST['items'] ?? '');
$total = trim($_POST['total'] ?? '0');

if (!$name || !$email || !$address || !$city || !$itemsJson) {
    json_response(['success' => false, 'error' => 'All order fields are required.']);
}

// validate items
$items = json_decode($itemsJson, true);
if (!is_array($items) || empty($items)) {
    json_response(['success' => false, 'error' => 'Cart is empty or invalid.']);
}

$totalFloat = (float) $total;
$orderId = 'ORD-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

$stmt = $conn->prepare(
    'INSERT INTO orders (order_id, customer_email, customer_name, address, city, items_json, total)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
);
$stmt->bind_param('ssssssd', $orderId, $email, $name, $address, $city, $itemsJson, $totalFloat);

if ($stmt->execute()) {
    // clear DB cart
    if (isset($_SESSION['user'])) {
        $userId = $_SESSION['user']['id'];
        $clearStmt = $conn->prepare('DELETE FROM cart WHERE user_id = ?');
        $clearStmt->bind_param('i', $userId);
        $clearStmt->execute();
        $clearStmt->close();
    }

    json_response([
        'success' => true,
        'orderId' => $orderId,
        'message' => 'Order placed successfully!'
    ]);
} else {
    json_response(['success' => false, 'error' => 'Failed to place order.'], 500);
}

$stmt->close();
$conn->close();
?>