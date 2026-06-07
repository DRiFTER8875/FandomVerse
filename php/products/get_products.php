<?php
header('Content-Type: application/json');
require_once '../db.php';

$result = $conn->query(
    'SELECT id, name, price, category, sub_category AS subCategory,
            image, keywords, is_limited AS isLimited,
            is_popular AS isPopular, stock,
            UNIX_TIMESTAMP(date_added) * 1000 AS dateAdded
     FROM products
     ORDER BY date_added DESC'
);

if (!$result) {
    json_response(['success' => false, 'error' => 'Failed to fetch products.'], 500);
}

$products = [];
while ($row = $result->fetch_assoc()) {
    
    $row['price'] = (float) $row['price'];
    $row['isLimited'] = (bool) $row['isLimited'];
    $row['isPopular'] = (bool) $row['isPopular'];
    $row['stock'] = (int) $row['stock'];
    $row['dateAdded'] = (int) $row['dateAdded'];
    $products[] = $row;
}

json_response(['success' => true, 'products' => $products]);
$conn->close();
?>