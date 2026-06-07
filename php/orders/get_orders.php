<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_login();

$user = $_SESSION['user'];

if ($user['role'] === 'admin') {
    $result = $conn->query(
        'SELECT id, order_id AS orderId, customer_email AS email,
                customer_name AS name, address, city,
                items_json AS items, total, status,
                DATE_FORMAT(created_at, "%d %b %Y") AS date
         FROM orders
         ORDER BY created_at DESC'
    );
} else {
    $email = $user['email'];
    $stmt = $conn->prepare(
        'SELECT id, order_id AS orderId, customer_email AS email,
                customer_name AS name, address, city,
                items_json AS items, total, status,
                DATE_FORMAT(created_at, "%d %b %Y") AS date
         FROM orders
         WHERE customer_email = ?
         ORDER BY created_at DESC'
    );
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    $row['total'] = (float) $row['total'];
    $row['items'] = json_decode($row['items'], true);
    $orders[] = $row;
}

json_response(['success' => true, 'orders' => $orders]);
$conn->close();
?>