<?php
// ============================================================
// FandomVerse — Get Cart (Logged-in user only)
// ============================================================
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_login();

$userId = $_SESSION['user']['id'];

$stmt = $conn->prepare(
    'SELECT c.id, c.product_id AS productId, c.quantity, c.size, c.material, c.delivery,
            p.name, p.price, p.image, p.category, p.sub_category AS subCategory
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?'
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $row['price']    = (float) $row['price'];
    $row['quantity'] = (int)   $row['quantity'];
    $items[]         = $row;
}

json_response(['success' => true, 'cart' => $items]);
$stmt->close();
$conn->close();
?>
