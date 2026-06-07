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

if (!$id || !$name || !$price || !$category || !$subCategory || !$image || !$keywords) {
    json_response(['success' => false, 'error' => 'All fields are required.']);
}

if (!is_numeric($price) || (float) $price <= 0) {
    json_response(['success' => false, 'error' => 'Price must be a positive number.']);
}

$priceFloat = (float) $price;

$stmt = $conn->prepare(
    'INSERT INTO products (id, name, price, category, sub_category, image, keywords, is_limited, is_popular, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->bind_param('ssdsssssii', $id, $name, $priceFloat, $category, $subCategory, $image, $keywords, $isLimited, $isPopular, $stock);

if ($stmt->execute()) {
    json_response([
        'success' => true,
        'product' => [
            'id' => $id,
            'name' => $name,
            'price' => $priceFloat,
            'category' => $category,
            'subCategory' => $subCategory,
            'image' => $image,
            'keywords' => $keywords,
            'isLimited' => (bool) $isLimited,
            'isPopular' => (bool) $isPopular,
            'stock' => $stock
        ]
    ]);
} else {
    if ($conn->errno === 1062) {
        json_response(['success' => false, 'error' => 'Product ID already exists.']);
    }
    json_response(['success' => false, 'error' => 'Failed to add product.'], 500);
}

$stmt->close();
$conn->close();
?>