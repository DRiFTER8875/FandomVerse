-- ============================================================
-- FandomVerse Database Setup
-- Run this ONCE in phpMyAdmin > SQL tab
-- ============================================================

CREATE DATABASE IF NOT EXISTS fandomverse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fandomverse_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    username    VARCHAR(30)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin','customer') NOT NULL DEFAULT 'customer',
    address     VARCHAR(255) DEFAULT NULL,
    province    VARCHAR(100) DEFAULT NULL,
    city        VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(20)  DEFAULT NULL,
    phone       VARCHAR(20)  DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id           VARCHAR(30)    PRIMARY KEY,
    name         VARCHAR(255)   NOT NULL,
    price        DECIMAL(10,2)  NOT NULL,
    category     VARCHAR(100)   NOT NULL,
    sub_category VARCHAR(100)   NOT NULL,
    image        VARCHAR(500)   NOT NULL,
    keywords     VARCHAR(500)   DEFAULT '',
    is_limited   TINYINT(1)     NOT NULL DEFAULT 0,
    is_popular   TINYINT(1)     NOT NULL DEFAULT 0,
    stock        INT            NOT NULL DEFAULT 15,
    date_added   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    order_id       VARCHAR(50)    NOT NULL UNIQUE,
    customer_email VARCHAR(100)   NOT NULL,
    customer_name  VARCHAR(150)   NOT NULL,
    address        VARCHAR(255)   NOT NULL,
    city           VARCHAR(100)   NOT NULL,
    items_json     TEXT           NOT NULL,
    total          DECIMAL(10,2)  NOT NULL,
    status         VARCHAR(50)    NOT NULL DEFAULT 'Processing',
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- CART TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    product_id  VARCHAR(30)  NOT NULL,
    quantity    INT          NOT NULL DEFAULT 1,
    size        VARCHAR(50)  DEFAULT 'Standard',
    material    VARCHAR(100) DEFAULT 'Standard',
    delivery    VARCHAR(100) DEFAULT 'Standard Delivery',
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id, size, material)
) ENGINE=InnoDB;

-- ============================================================
-- SEED: ADMIN USERS (passwords are hashed versions of the originals)
-- admin123 and admin456 — pre-hashed below (bcrypt cost 10)
-- You can regenerate with: echo password_hash('admin123', PASSWORD_BCRYPT);
-- ============================================================
INSERT IGNORE INTO users (first_name, last_name, username, email, password, role) VALUES
('Drifter', 'Admin', 'admin',  'admin.drifter@fandomverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Ryzlo',   'Admin', 'admin2', 'admin.ryzlo@fandomverse.com',   '$2y$10$TKh8H1.PkR6m3fRuoNhqUuFpUjWQzNg2yYHEcv4vE2I1F4HNEZJK6', 'admin');
-- Note: The hashes above are placeholders. The login.php will also accept
-- the plaintext check for admins, OR run the hash generator below in phpMyAdmin:
-- SELECT PASSWORD('admin123'); -- not bcrypt, use PHP instead
-- Best: after setup, visit php/auth/generate_admin_hash.php once to update them.

-- ============================================================
-- SEED: ALL 51 PRODUCTS (from original script.js)
-- ============================================================
INSERT IGNORE INTO products (id, name, price, category, sub_category, image, keywords, is_limited, is_popular, stock) VALUES
('prod_1',  'Gojo Figure',                                    3500.00, 'Anime',           'Figure',  'gojo figure.webp',         'figure, anime, gojo, jjk',         0, 0, 15),
('prod_2',  'One Piece - Monkey D. Luffy Poster',             2400.00, 'Anime',           'Poster',  'luffy.png',                'poster, anime, luffy, one piece',   0, 0, 15),
('prod_3',  'Dragon Ball - Goku Figure',                      4200.00, 'Anime',           'Figure',  'goku figure.jpg',          'figure, anime, goku, dragonball',   0, 0, 15),
('prod_4',  'Demon Slayer Poster',                            2150.00, 'Anime',           'Poster',  'DemonSlayer.png',          'poster, anime, demon slayer',       0, 0, 15),
('prod_5',  'Naruto Figure',                                  3850.00, 'Anime',           'Figure',  'naruto figure.jpg',        'figure, anime, naruto',             0, 0, 15),
('prod_6',  'Your Name Poster',                               2200.00, 'Anime',           'Poster',  'Yourname.png',             'poster, anime, your name',          0, 0, 15),
('prod_7',  'Chainsaw Man - Makima Poster',                   2300.00, 'Anime',           'Poster',  'Makima.png',               'poster, anime, chainsaw man',       0, 0, 15),
('prod_8',  'Attack on Titan Poster',                         2250.00, 'Anime',           'Poster',  'AOT.png',                  'poster, anime, attack on titan',    0, 0, 15),
('prod_9',  'Dragon Ball Super Poster',                       2100.00, 'Anime',           'Poster',  'DB.png',                   'poster, anime, dragon ball',        0, 0, 15),
('prod_10', 'Horimiya Poster',                                2400.00, 'Anime',           'Poster',  'Horimiya.png',             'poster, anime, horimiya',           0, 0, 15),
('prod_11', 'Naruto Poster',                                  2200.00, 'Anime',           'Poster',  'Naruto.png',               'poster, anime, naruto',             0, 0, 15),
('prod_12', 'Darling in the Franxx - Zero Two Poster',        2350.00, 'Anime',           'Poster',  'ZeroTwo.png',              'poster, anime, zero two, darling',  0, 0, 15),
('prod_13', 'RDR 2 - Arthur Morgan Poster',                   2600.00, 'Games',           'Poster',  'Arthur rdr.png',           'poster, games, rdr, arthur',        0, 0, 15),
('prod_14', 'Call of Duty - Captain Price',                   2800.00, 'Games',           'Merch',   'Captain price.png',        'merch, games, cod, captain price',  0, 0, 15),
('prod_15', 'The Witcher 3 - Cirilla of Cintra',              2500.00, 'Games',           'Merch',   'Ciri.png',                 'merch, games, witcher, ciri',       0, 0, 15),
('prod_16', 'GTA San Andreas - CJ Poster',                    2400.00, 'Games',           'Poster',  'CJ.png',                   'poster, games, gta, cj',            0, 0, 15),
('prod_17', 'Detroit Become Human - Connor Poster',           2300.00, 'Games',           'Poster',  'Connor.png',               'poster, games, detroit, connor',    0, 0, 15),
('prod_18', 'God of War - Kratos Figure',                     4800.00, 'Games',           'Figure',  'kratos figure.avif',       'figure, games, god of war, kratos', 0, 0, 15),
('prod_19', 'The Witcher 3 - Geralt of Rivia',                2900.00, 'Games',           'Merch',   'Geralt.png',               'merch, games, witcher, geralt',     0, 0, 15),
('prod_20', 'Ghost of Tsushima Poster',                       2550.00, 'Games',           'Poster',  'ghost.jpg',                'poster, games, ghost of tsushima',  0, 0, 15),
('prod_21', 'Call of Duty - Ghost Poster',                    2450.00, 'Games',           'Poster',  'Ghost.png',                'poster, games, cod, ghost',         0, 0, 15),
('prod_22', 'RDR - John Marston Poster',                      2350.00, 'Games',           'Poster',  'John rdr.png',             'poster, games, rdr, john marston',  0, 0, 15),
('prod_23', 'Call of Duty - Ghost Figure',                    4950.00, 'Games',           'Figure',  'ghost figure.webp',        'figure, games, cod, ghost',         0, 0, 15),
('prod_24', 'Ben 10 Poster',                                  2100.00, 'Cartoon',         'Poster',  'ben10.jpg',                'poster, cartoon, ben 10',           0, 0, 15),
('prod_25', 'Avatar the Last Airbender Poster',               2200.00, 'Cartoon',         'Poster',  'avatar.jpg',               'poster, cartoon, avatar',           0, 0, 15),
('prod_26', 'Regular Show - Mordakai and Rigby Poster',       2300.00, 'Cartoon',         'Poster',  'regular show.jpg',         'poster, cartoon, regular show',     0, 0, 15),
('prod_27', 'Ben 10 - Monster Kevin 11 Figure',               3500.00, 'Cartoon',         'Figure',  'kevin11 figure.avif',      'figure, cartoon, ben 10, kevin',    0, 0, 15),
('prod_28', 'Avatar The Last Airbender Poster',               2400.00, 'Cartoon',         'Poster',  'avatar1.jpg',              'poster, cartoon, avatar',           0, 0, 15),
('prod_29', 'Pink Panther Poster',                            2250.00, 'Cartoon',         'Poster',  'pink panther.jpg',         'poster, cartoon, pink panther',     0, 0, 15),
('prod_30', 'Oggy and the Cockroaches Poster',                2150.00, 'Cartoon',         'Poster',  'oggy.jpg',                 'poster, cartoon, oggy',             0, 0, 15),
('prod_31', 'Tom and Jerry Poster',                           2200.00, 'Cartoon',         'Poster',  'tom and jerry.jpg',        'poster, cartoon, tom and jerry',    0, 0, 15),
('prod_32', 'Ben 10 - Swampfire Figure',                      3800.00, 'Cartoon',         'Figure',  'swampfire figure.webp',    'figure, cartoon, ben 10, swampfire',0, 0, 15),
('prod_33', 'Powerpuff Girls Poster',                         2400.00, 'Cartoon',         'Poster',  'powerpuff girls.jpg',      'poster, cartoon, powerpuff girls',  0, 0, 15),
('prod_34', 'Regular Show Figure',                            3600.00, 'Cartoon',         'Figure',  'regular show figure.webp', 'figure, cartoon, regular show',     0, 0, 15),
('prod_35', 'Teen Titans Go Poster',                          2300.00, 'Cartoon',         'Poster',  'teen titans go.jpg',       'poster, cartoon, teen titans',      0, 0, 15),
('prod_36', 'Adventure Time Poster',                          2250.00, 'Cartoon',         'Poster',  'adventure time.jpg',       'poster, cartoon, adventure time',   0, 0, 15),
('prod_37', 'Iron Man Figure',                                4900.00, 'Movies',          'Figure',  'iron man figure.jfif',     'figure, movies, iron man, marvel',  0, 0, 15),
('prod_38', 'Game of Thrones - John Snow Poster',             2450.00, 'TV Shows',        'Poster',  'johnsnow.png',             'poster, tv shows, game of thrones', 0, 0, 15),
('prod_39', 'Superman Poster',                                2100.00, 'TV Shows',        'Poster',  'Super man.png',            'poster, tv shows, superman',        0, 0, 15),
('prod_40', 'Breaking Bad - Walter White(Heisenberge) Poster',2500.00, 'TV Shows',        'Poster',  'Walter.png',               'poster, tv shows, breaking bad',    0, 0, 15),
('prod_41', 'Iron Man Poster',                                2400.00, 'Movies',          'Poster',  'iron man.webp',            'poster, movies, iron man, marvel',  0, 0, 15),
('prod_42', 'Stranger Things Poster',                         2350.00, 'Movies',          'Poster',  'stranger things.jpg',      'poster, movies, stranger things',   0, 0, 15),
('prod_43', 'My DressUp Darling - Marin',                     4500.00, 'Anime',           'Merch',   'Figure.jpg',               'merch, anime, dress up darling',    0, 0, 15),
('prod_44', 'One Piece Poster - Monkey D. Luffy',             2199.00, 'Anime',           'Poster',  'luffy.png',                'poster, anime, luffy, one piece',   0, 0, 15),
('prod_45', 'RDR2 - Arthur Morgan',                           3800.00, 'Games',           'Merch',   'Arthur rdr.png',           'merch, games, rdr, arthur morgan',  0, 0, 15),
('prod_46', 'The Boys T-Shirt',                               2450.00, 'Movies & TV Shows','Merch',  'MERCH.jpg',                'merch, tv shows, the boys',         0, 0, 15),
('prod_47', 'Call of Duty - Ghost',                           2750.00, 'Games',           'Merch',   'Ghost.png',                'merch, games, cod, ghost',          0, 0, 15),
('prod_48', 'Arcane - Jinx Figure',                           4999.00, 'Movies & TV Shows','Figure', 'jinxFigure.png',           'figure, tv shows, arcane, jinx',    0, 0, 15),
('prod_49', 'League of Legends Jinx Action Figure',           4200.00, 'Games',           'Figure',  'https://images.unsplash.com/photo-1605114841961-da286d9a9235?w=600&h=800&fit=crop&q=80', 'figure, games, lol, jinx', 0, 0, 15),
('prod_50', 'Call of Duty: Ghost Skull Premium T-Shirt',      2950.00, 'Games',           'Merch',   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&q=80',  'merch, games, cod, ghost', 0, 0, 15),
('prod_51', 'Spider-Man Vintage Comic Poster',                3500.00, 'Movies',          'Poster',  'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&h=800&fit=crop&q=80',  'poster, movies, spiderman, marvel', 0, 0, 15);
