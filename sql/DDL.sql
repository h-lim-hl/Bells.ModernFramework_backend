DROP DATABASE ecommerce;
CREATE DATABASE ecommerce;

USE ecommerce;

-- Products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) NOT NULL
);

-- Product Stock table
CREATE TABLE product_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  store INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  salutation VARCHAR(10),
  country VARCHAR(50),
  created_at DATETIME
);

DELIMITER $$
CREATE TRIGGER users_insert_set_created_at_to_now
  BEFORE INSERT ON users
  FOR EACH ROW
  BEGIN
    IF NEW.created_at IS NULL THEN
      SET NEW.created_at = NOW();
    END IF;
END $$
DELIMITER ;

-- Staff Types table
CREATE TABLE role_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_type VARCHAR(100) NOT NULL
);

-- Staff Roles table
CREATE TABLE staff_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES role_types(id)
);

-- Marketing Preference table
CREATE TABLE marketing_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preference VARCHAR(50) NOT NULL UNIQUE
);

-- User Marketing Preference table
CREATE TABLE user_marketing_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  preference_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (preference_id) REFERENCES marketing_preferences(id) ON DELETE CASCADE
);

-- Cart Items table
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
-- an ENUM data type is a string (varchar) but it can only be one of the specified values
  status ENUM('pending', 'completed', 'cancelled', 'shipping', 'processing') DEFAULT 'pending',
-- for Stripe
  checkout_session_id VARCHAR(255),
  created_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- trigger to set created at to current time if inserted as null
DELIMITER $$
CREATE TRIGGER orders_insert_set_created_at_to_now
  BEFORE INSERT ON orders
  FOR EACH ROW
  BEGIN
    IF NEW.created_at IS NULL THEN
      SET NEW.created_at = NOW();
    END IF;
END $$
DELIMITER ;

-- Order Items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Discount Type table
CREATE TABLE discount_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Discounts table
CREATE TABLE discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  discount_type INT NOT NULL,
  start_datetime DATETIME DEFAULT NULL,
  end_datetime DATETIME DEFAULT NULL,
  amount DECIMAL(5,3) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (discount_type) REFERENCES discount_types(id)
);

-- Personal Discounts table
CREATE TABLE personal_discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  discount_id INT NOT NULL,
  assigned_to INT NOT NULL,
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
);

-- Discount Description table
CREATE TABLE discount_descriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  discount_id INT NOT NULL,
  description VARCAR(500) DEFAULT NULL,
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE
);

-- :'(

-- Discount Redemption table -- This is for one use codes per user
CREATE TABLE discount_redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  discount_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (discount_id) REFERENCES discounts(id)
);

-- ======= CANNOT BE DONE SQL VERSION TOO SAD(old) need 5.5
-- Create insert trigger to set end_datetime to 30D after start_datetime if not set.
-- DELIMITER $$
-- CREATE TRIGGER discounts_set_end_date_30D_after_start_datetime_if_null_trigger
--   BEFORE INSERT ON discounts
--   FOR EACH ROW
--   BEGIN
--     IF (NEW.start_datetime IS NOT NULL) THEN
--       IF (NEW.end_datetime IS NULL) THEN
--         SET NEW.end_datetime = DATE_ADD(NEW.start_datetime, INTERVAL 30 DAY);
--       
--       ELSEIF(NEW.end_datetime < NEW.start_datetime) THEN
--         SIGNAL SQLSTATE '45000'
--           SET MESSAGE_TEXT = 'end_datetime must be after start_datetime';
--       
--       END IF;
--     END IF;
-- END $$
-- DELIMITER ;

-- Create update trigger check for end_datetime after start_datetime
-- DELIMITER $$
-- CREATE TRIGGER discounts_update_assert_end_datetime_after_start_datetime_trigger
--   BEFORE UPDATE ON discounts
--   FOR EACH ROW
--   BEGIN
--     IF (NEW.end_datetime IS NOT NULL AND NEW.start_datetime IS NOT NULL)
--         AND (NEW.end_datetime < NEW.start_datetime) THEN
--       SIGNAL SQLSTATE '45000'
--         SET MESSAGE_TEXT = 'end_datetime must be after start_datetime';
--     END IF;
-- END $$
-- DELIMITER ;
-- =======