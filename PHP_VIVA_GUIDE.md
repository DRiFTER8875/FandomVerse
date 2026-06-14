# 🎓 FandomVerse: PHP & Backend Viva Cheat Sheet (15-Minute Session Guide)

This guide is designed to help you ace your **15-minute viva session**. It covers the architecture, database, PHP backend codebase, key technical features to highlight, and answers to common examiner questions.

---

## 📅 Part 1: 15-Minute Presentation Outline

Here is a recommended timeline for your 15-minute presentation:

| Time | Phase | Focus |
| :--- | :--- | :--- |
| **00:00 - 02:00** | **Introduction & Architecture** | Explain what the project is (FandomVerse: an e-commerce platform for pop culture merch) and how the client-server architecture works (HTML/JS frontend contacting a PHP REST API via `fetch()` and JSON). |
| **02:00 - 05:00** | **Database Schema** | Show the entity relations (Users ➔ Cart/Orders ➔ Products). Highlight the tables, primary/foreign keys, and standard normalization. |
| **05:00 - 10:00** | **PHP Backend Walkthrough** | Show the code! Start with [db.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/db.php) (the connection & security middleware), explain user auth (login/registration), explain the dynamic cart operations, and show order placement. |
| **10:00 - 12:00** | **Security & Best Practices** | Brag about **Prepared Statements** (SQL Injection prevention), **Bcrypt Password Hashing** (security), and **Session-based Authorization** (unauthorized access prevention). |
| **12:00 - 15:00** | **Q&A / Interactive Demo** | Answer examiner questions and show the admin panel / customer checkout flows. |

---

## 🌐 Part 2: Architecture & Flow

FandomVerse uses a **decoupled Client-Server model**:
1. **Frontend**: Static HTML, CSS, and vanilla JavaScript files loaded by the user's browser.
2. **Communication Layer**: JavaScript uses the `fetch()` API to send asynchronous AJAX requests (`POST` or `GET`) containing Form Data or JSON.
3. **Backend**: Lightweight PHP scripts process the request, interact with the MySQL database using `mysqli` prepared statements, and return a **JSON response** (e.g. `{"success": true, "message": "..."}`).
4. **No Page Reloads**: Most actions (adding to cart, updating profile, placing orders, deleting products) happen instantly without full page reloads, providing a smooth Single Page App (SPA) experience.

---

## 🗄️ Part 3: Database Schema Overview

The database is named `fandomverse_db` and has 4 main tables (defined in [setup.sql](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/setup.sql)):

1. **`users`**: Stores client/admin credentials, hashes of passwords, role types (`customer` vs `admin`), and delivery address details.
2. **`products`**: Product information including unique alphanumeric IDs, category, sub-category, price, image URL, stock count, and boolean flags (`is_limited`, `is_popular`).
3. **`cart`**: Junction/associative table representing user shopping carts. Maps a `user_id` to a `product_id` with metadata like size, material, delivery option, and quantity. Uses a `UNIQUE KEY (user_id, product_id, size, material)` to prevent duplicate entries (instead incrementing quantity).
4. **`orders`**: Stores final order records, customer contact details, order total, and the cart items list serialized as a JSON string (`items_json`).

---

## 💻 Part 4: Code Breakdown (File-by-File)

All PHP code is modular and resides under the `/php/` directory.

### 🔑 1. Core Config & Helper: [db.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/db.php)
This is the single most important file. Every other PHP file includes it (`require_once '../db.php'`).
- **Connection**: Initializes a connection to MySQL using the standard `mysqli` driver.
- **`json_response($data, $status)`**: Standardizes API outputs. Sets `Content-Type: application/json`, HTTP response codes (e.g., 200, 401, 403, 500), and outputs JSON before exiting.
- **`require_login()`**: Middleware function. Starts a session and verifies if `$_SESSION['user']` is set. Returns a `401 Unauthorized` JSON response if not logged in.
- **`require_admin()`**: Middleware function. Verifies if the logged-in user's role is `admin`. Returns a `403 Forbidden` JSON response if not.

---

### 🔐 2. Authentication: `/php/auth/`
*   **[register.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/auth/register.php)**:
    *   Receives registration data via `POST`.
    *   Performs validation (e.g., name required, email valid, password complexity validation).
    *   Checks if the username or email is already taken.
    *   Hashes the password securely: `$hashed = password_hash($password, PASSWORD_BCRYPT)`.
    *   Inserts the new customer into the `users` table.
*   **[login.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/auth/login.php)**:
    *   Finds the user by `username`.
    *   Verifies password using `password_verify($password, $user['password'])`.
    *   Sets up PHP Session variable: `$_SESSION['user'] = [...]` containing user ID, username, email, and role.
    *   Automatically upgrades legacy raw passwords for admin accounts to Bcrypt hashes when logging in.
    *   Specifies client redirection target depending on the role (`admin_dashboard.html` vs `index.html`).
*   **[check_session.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/auth/check_session.php)**:
    *   Called by the frontend on page load to verify if a session is currently active. Returns the user details or `loggedIn: false`.
*   **[logout.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/auth/logout.php)**:
    *   Clears `$_SESSION`, invalidates session cookies, and terminates the session via `session_destroy()`.
*   **[update_profile.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/auth/update_profile.php)**:
    *   Requires login. Allows customers to change their email and password. Generates new password hashes dynamically.

---

### 🛒 3. Cart Management: `/php/cart/`
*   **[get_cart.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/cart/get_cart.php)**:
    *   Requires login. Queries the `cart` table, joining it with the `products` table on `product_id = products.id` to retrieve full product details (name, price, image) for current cart items.
*   **[update_cart.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/cart/update_cart.php)**:
    *   Requires login. Inserts or updates items in the database.
    *   Uses a unique SQL feature: `ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`. If a matching item (same user, product, size, material) already exists, it increases the quantity instead of inserting a duplicate row.
*   **[clear_cart.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/cart/clear_cart.php)**:
    *   Requires login. Wipes the user's cart rows when they manual click empty or proceed to place an order.

---

### 📦 4. Orders: `/php/orders/`
*   **[place_order.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/orders/place_order.php)**:
    *   Processes orders. Can work for both guest accounts and logged-in users.
    *   Receives customer name, address, payment method, order total, and the cart items list serialized as a JSON string (`items`).
    *   Validates details and formats a unique random transaction order ID (e.g. `ORD-E3A94F80`).
    *   Saves the order into the `orders` table. If the user is logged in, it clears their database cart items.
*   **[get_orders.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/orders/get_orders.php)**:
    *   Requires login.
    *   **Role-Based Data Filtering**: If the user is an `admin`, it queries *all* orders in the database. If the user is a `customer`, it prepares a query to filter and return only orders matching their own email.
    *   Deserializes `items_json` back into PHP arrays using `json_decode()` before responding to the frontend.

---

### 🛠️ 5. Products & Users (Admin controls): `/php/products/` & `/php/users/`
*   **[get_products.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/products/get_products.php)**:
    *   Public endpoint. Queries all products from the `products` table ordered by the newest addition date.
*   **[add_product.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/products/add_product.php)**:
    *   Requires admin role. Inserts a new product into the database. Checks for duplicate primary keys.
*   **[update_product.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/products/update_product.php)**:
    *   Requires admin role. Modifies product attributes (name, price, stock, category, tags, images).
*   **[delete_product.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/products/delete_product.php)**:
    *   Requires admin role. Deletes a product. Because of the foreign key constraint `ON DELETE CASCADE` in the database, deleting a product automatically cleanses it from any active customer carts.
*   **[get_users.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/users/get_users.php)**:
    *   Requires admin role. Returns a list of all registered users.
*   **[delete_user.php](file:///c:/xampp/htdocs/FandomVerse/FandomVerse/php/users/delete_user.php)**:
    *   Requires admin role. Deletes a user by ID. Prevents administrators from accidentally deleting themselves by checking `if ($id === (int)$_SESSION['user']['id'])`.

---

## 🔒 Part 5: Security Best Practices (Things to "Brag" About)

When the examiner asks how your website is secure, highlight these three design pillars:

1.  **SQL Injection Prevention via Prepared Statements**:
    *   *What we did*: Instead of concatenating variables directly into queries (e.g., `WHERE username = '$username'`), we compile templates with placeholders (e.g., `WHERE username = ?`) and bind parameters safely using `$stmt->bind_param()`.
    *   *Why it works*: The database treats variables strictly as data parameters, never executable SQL commands, neutralizing SQL Injection attacks.
2.  **Cryptographic Password Hashing**:
    *   *What we did*: We never store plain passwords. We hash them using `password_hash($password, PASSWORD_BCRYPT)`.
    *   *Why it works*: Bcrypt is a industry-standard hashing algorithm that incorporates a unique salt and key stretching. If the database leaks, user passwords cannot be reverse-engineered.
3.  **Role-Based Authorization checks**:
    *   *What we did*: Crucial endpoints verify credentials. Simply knowing the URL of admin scripts (like `delete_user.php`) is useless because `require_admin()` intercepts execution and issues a HTTP 403 Forbidden.

---

## ❓ Part 6: Expected Viva Questions & Answers

### Q1: Why did you use PHP and not nodeJS/Python?
> **Answer**: PHP is exceptionally suited for server-side web scripting. It integrates natively with Apache and MySQL (especially in XAMPP environments) with no extra setups, supports sessions natively, and runs synchronously, keeping the REST API scripts lightweight, easy to maintain, and fast.

### Q2: How does your application maintain state (know who is logged in)?
> **Answer**: We use standard PHP Session management. On successful login, the server sets a session variable `$_SESSION['user']` and sends a session ID cookie (PHPSESSID) to the client's browser. For every subsequent API request, PHP automatically reads this cookie to reconstruct the user's state.

### Q3: What happens to a user's cart when they log out or place an order?
> **Answer**: On logout, the PHP session is destroyed, but the cart items remain in the database so that when they log in again from another device, their cart is preserved. On placing an order, `place_order.php` deletes the corresponding rows from the `cart` table for that user ID, shifting the products to the permanent `orders` table.

### Q4: How does the admin dashboard prevent unauthorized users from calling edit endpoints?
> **Answer**: Front-end validation (hiding links) is only cosmetic. The true security is server-side. Every single admin file calls `require_admin()` at the top. This function checks if `$_SESSION['user']['role']` is `'admin'`. If someone makes an unauthorized API call (e.g., through Postman or a custom cURL script), the backend immediately rejects it with a `403 Forbidden` response code and halts execution.

### Q5: What is the purpose of `ON DUPLICATE KEY UPDATE` in your cart query?
> **Answer**: The database `cart` table has a composite unique index: `(user_id, product_id, size, material)`. If a user adds the exact same item configuration to their cart twice, SQL triggers a duplicate key conflict. Instead of failing or creating a second row, `ON DUPLICATE KEY UPDATE` intercepts this conflict and updates the existing row by adding the new quantity to the existing quantity.

---

*Good luck with your viva session! Keep your answers brief, mention prepared statements & hashing first, and show confidence.*
