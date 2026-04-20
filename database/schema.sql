-- ===========================================
-- E-Commerce Database Schema
-- ===========================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Tabel Users
CREATE TABLE users (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('user', 'admin') DEFAULT 'user',
    phone       VARCHAR(15),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Categories
CREATE TABLE categories (
    id    INT PRIMARY KEY AUTO_INCREMENT,
    name  VARCHAR(100) NOT NULL,
    slug  VARCHAR(100) UNIQUE NOT NULL
);

-- Tabel Products
CREATE TABLE products (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    category_id  INT,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) UNIQUE NOT NULL,
    description  TEXT,
    price        DECIMAL(10,2) NOT NULL,
    stock        INT DEFAULT 0,
    image        VARCHAR(255),
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabel Cart
CREATE TABLE cart (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart (user_id, product_id)
);

-- Tabel Orders
CREATE TABLE orders (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    user_id          INT NOT NULL,
    total_price      DECIMAL(10,2) NOT NULL,
    status           ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method   VARCHAR(50),
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Order Items
CREATE TABLE order_items (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabel Payments
CREATE TABLE payments (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT UNIQUE NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    method         VARCHAR(50),
    status         ENUM('pending','success','failed') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    paid_at        TIMESTAMP NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Tabel Addresses
CREATE TABLE addresses (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL,
    label       VARCHAR(50),
    address     TEXT NOT NULL,
    city        VARCHAR(100),
    province    VARCHAR(100),
    postal_code VARCHAR(10),
    is_default  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO categories (name, slug) VALUES
('Elektronik', 'elektronik'),
('Fashion', 'fashion'),
('Makanan & Minuman', 'makanan-minuman'),
('Kesehatan', 'kesehatan');

INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@toko.com', '$2a$10$examplehashedpassword', 'admin');
