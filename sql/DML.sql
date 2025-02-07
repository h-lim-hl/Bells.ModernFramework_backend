use ecommerce;

INSERT INTO products (name, price, image) VALUES
('Sleek Smartwatch', 199.99, 'https://picsum.photos/id/20/300/200'),
('Wireless Earbuds', 79.99, 'https://picsum.photos/id/1/300/200'),
('Portable Power Bank', 49.99, 'https://picsum.photos/id/26/300/200'),
('HD Action Camera', 129.99, 'https://picsum.photos/id/96/300/200');

INSERT INTO product_stock (product_id)
SELECT id
FROM products;

INSERT INTO staff_types (staff_type) 
VALUES ("test_owner"), ("owner"), ("manager"), ("staff");

INSERT INTO marketing_preferences (id, preference) VALUES (1, 'email');  -- Email Marketing
INSERT INTO marketing_preferences (id, preference) VALUES (2, 'sms');    -- SMS Marketing

INSERT INTO discount_types (name) VALUES
  ("period_code"), ("single_code"), ("user_code");

INSERT INTO discounts (name, code, discount_type, start_datetime, end_datetime, amount, description) VALUES
("period_discount", "PERIOD10", 0, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 181 DAY), 0.1, "Test Peroid Discount"),
("single_code", "WELCOME25", 2, NULL, NULL, 0.25, "Test New User Discount");