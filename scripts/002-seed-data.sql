-- Insert sample locations
INSERT INTO locations (name, type, address) VALUES
('Main Warehouse', 'warehouse', '123 Industrial Blvd, City, State 12345'),
('Store #1', 'store', '456 Main St, Downtown, State 12345'),
('Store #2', 'store', '789 Oak Ave, Uptown, State 12345'),
('Online Store', 'online', 'Virtual Location');

-- Insert sample products
INSERT INTO products (name, category, sku, price, description, status) VALUES
('Premium Denim Jacket', 'Apparel', 'PDJ-001', 89.99, 'High-quality denim jacket with premium finish', 'active'),
('Casual Sneakers', 'Footwear', 'CS-002', 59.99, 'Comfortable casual sneakers for everyday wear', 'active'),
('Graphic T-Shirt', 'Apparel', 'GTS-003', 24.99, 'Cotton t-shirt with unique graphic design', 'active'),
('Leather Wallet', 'Accessories', 'LW-004', 39.99, 'Genuine leather wallet with multiple compartments', 'active'),
('Summer Hat', 'Accessories', 'SH-005', 19.99, 'Lightweight summer hat with UV protection', 'active'),
('Winter Scarf', 'Accessories', 'WS-006', 29.99, 'Warm winter scarf made from soft wool blend', 'active'),
('Sunglasses', 'Accessories', 'SG-007', 49.99, 'Stylish sunglasses with UV protection', 'active');

-- Insert sample inventory data
WITH product_locations AS (
    SELECT p.id as product_id, l.id as location_id, p.name, l.name as location_name
    FROM products p
    CROSS JOIN locations l
)
INSERT INTO inventory (product_id, location_id, quantity, reorder_point)
SELECT 
    product_id,
    location_id,
    CASE 
        WHEN location_name = 'Main Warehouse' THEN FLOOR(RANDOM() * 100 + 50)::INTEGER
        WHEN location_name LIKE 'Store%' THEN FLOOR(RANDOM() * 50 + 10)::INTEGER
        ELSE FLOOR(RANDOM() * 200 + 100)::INTEGER
    END as quantity,
    CASE 
        WHEN location_name = 'Main Warehouse' THEN 20
        WHEN location_name LIKE 'Store%' THEN 10
        ELSE 50
    END as reorder_point
FROM product_locations;

-- Update some inventory to show low stock and out of stock scenarios
UPDATE inventory SET quantity = 12 WHERE product_id = (SELECT id FROM products WHERE sku = 'SH-005') AND location_id = (SELECT id FROM locations WHERE name = 'Main Warehouse');
UPDATE inventory SET quantity = 0 WHERE product_id = (SELECT id FROM products WHERE sku = 'WS-006') AND location_id = (SELECT id FROM locations WHERE name = 'Store #1');
UPDATE inventory SET quantity = 8 WHERE product_id = (SELECT id FROM products WHERE sku = 'SG-007') AND location_id = (SELECT id FROM locations WHERE name = 'Store #2');

-- Insert sample sales data for analytics
INSERT INTO sales (product_id, location_id, quantity, unit_price, total_amount, sale_date)
SELECT 
    p.id,
    l.id,
    FLOOR(RANDOM() * 5 + 1)::INTEGER as quantity,
    p.price,
    p.price * FLOOR(RANDOM() * 5 + 1)::INTEGER,
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
FROM products p
CROSS JOIN locations l
WHERE l.type IN ('store', 'online')
ORDER BY RANDOM()
LIMIT 100;
