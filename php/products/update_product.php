<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$id = trim($_POST['id'] ?? '');
$name = trim($_POST['name'] ?? '');
$price = trim($_POST['price'] ?? '');
$category = trim($_POST['category'] ?? '');
$subCategory = trim($_POST['subCategory'] ?? '');
$image = trim($_POST['image'] ?? '');
$keywords = trim($_POST['keywords'] ?? '');
$isLimited = isset($_POST['isLimited']) && $_POST['isLimited'] === 'true' ? 1 : 0;
$isPopular = isset($_POST['isPopular']) && $_POST['isPopular'] === 'true' ? 1 : 0;
$stock = (int) ($_POST['stock'] ?? 15);

if (!$id || !$name || !$price || !$category || !$subCategory || !$image) {
    json_response(['success' => false, 'error' => 'All required fields must be provided.']);
}

if (!is_numeric($price) || (float) $price <= 0) {
    json_response(['success' => false, 'error' => 'Price must be a positive number.']);
}

$priceFloat = (float) $price;

$stmt = $conn->prepare(
    'UPDATE products
     SET name = ?, price = ?, category = ?, sub_category = ?,
         image = ?, keywords = ?, is_limited = ?, is_popular = ?, stock = ?
     WHERE id = ?'
);

$stmt->bind_param('sdssssiiis', $name, $priceFloat, $category, $subCategory, $image, $keywords, $isLimited, $isPopular, $stock, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows === 0) {
        json_response(['success' => false, 'error' => 'Product not found or nothing changed.']);
    }
    json_response(['success' => true, 'message' => 'Product updated successfully.']);
} else {
    json_response(['success' => false, 'error' => 'Update failed: ' . $conn->error], 500);
}

$stmt->close();
$conn->close();
?>