-- Admin user seed data (MySQL compatible - using INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO users (email, password, firstname, lastname, enabled, account_non_expired, account_non_locked, credentials_non_expired, failed_login_attempts, created_at, updated_at)
VALUES ('admin@example.com', '$2a$10$rDkPvvAFV8kqwvKJzwlRv.i.q.wz1w1pz0nFsA4uUT7BQo6Y0nYQO', 'Admin', 'User', true, true, true, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add admin role to admin user (fixed to handle duplicates and multiple rows)
INSERT IGNORE INTO user_roles (user_id, roles)
VALUES ((SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1), 'ADMIN');

-- Sample categories (using INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO categories (name, description, created_at, updated_at)
VALUES
('Electronics', 'Electronic devices and accessories', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Clothing', 'Men and women clothing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Books', 'Various books and novels', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Home & Garden', 'Home improvement and garden supplies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample products (using INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO products (name, description, price, category_id, active, deleted, created_at, updated_at)
VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation and long battery life', 99.99, (SELECT id FROM categories WHERE name = 'Electronics'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Smartphone Case', 'Protective case for smartphones with wireless charging support and drop protection', 24.99, (SELECT id FROM categories WHERE name = 'Electronics'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laptop Stand', 'Adjustable laptop stand for better ergonomics and improved airflow', 49.99, (SELECT id FROM categories WHERE name = 'Electronics'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4K Webcam', 'Ultra HD webcam with auto-focus and built-in microphone for video calls', 129.99, (SELECT id FROM categories WHERE name = 'Electronics'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cotton T-Shirt', 'Comfortable 100% cotton t-shirt available in multiple colors and sizes', 19.99, (SELECT id FROM categories WHERE name = 'Clothing'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Denim Jeans', 'Classic fit denim jeans with comfortable stretch fabric', 59.99, (SELECT id FROM categories WHERE name = 'Clothing'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Winter Jacket', 'Warm winter jacket with water-resistant material and insulation', 89.99, (SELECT id FROM categories WHERE name = 'Clothing'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Programming Book', 'Learn modern web development with this comprehensive guide to React and Node.js', 39.99, (SELECT id FROM categories WHERE name = 'Books'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Science Fiction Novel', 'Bestselling science fiction novel with thrilling space adventure', 14.99, (SELECT id FROM categories WHERE name = 'Books'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Garden Tools Set', 'Complete set of garden tools including shovel, rake, and pruning shears', 79.99, (SELECT id FROM categories WHERE name = 'Home & Garden'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LED Desk Lamp', 'Adjustable LED desk lamp with multiple brightness levels and USB charging port', 34.99, (SELECT id FROM categories WHERE name = 'Home & Garden'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Plant Pots Set', 'Set of 6 ceramic plant pots with drainage holes in various sizes', 29.99, (SELECT id FROM categories WHERE name = 'Home & Garden'), true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample inventory items for products (using INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO inventory_items (product_id, stock_quantity, min_stock_level, max_stock_level, reserved_quantity, track_inventory, active, deleted, created_at, updated_at)
SELECT p.id, 50, 10, 200, 0, true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_items i WHERE i.product_id = p.id
);