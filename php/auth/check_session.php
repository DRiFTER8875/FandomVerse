<?php
// ============================================================
// FandomVerse — Check Session Handler
// Called on every page load to restore UI login state
// ============================================================
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    echo json_encode([
        'loggedIn' => true,
        'user'     => $_SESSION['user']
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
