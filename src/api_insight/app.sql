-- Create products table
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "order" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER DEFAULT 0,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS orderitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_item_id INTEGER DEFAULT 0,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "order"(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER DEFAULT 0,
    product_id INTEGER,
    rating INTEGER NOT NULL DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(productid)
);

-- Create and populate products table
INSERT INTO product (
    name,
    description,
    price,
    image_url,
    category,
    in_stock
) VALUES 
    ('Laptop', 'High-performance laptop', 999.99, 'https://via.placeholder.com/150', 'Electronics', false);

-- Create and populate orders table
INSERT INTO "order" (
    order_id,
    customer_email,
    status,
    total_amount,
    created_at,
    updated_at
) VALUES 
    (0, 'customer1', 'PENDING', 1199.98, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create and populate order items table
INSERT INTO orderitem (
    order_item_id,
    order_id,
    product_id,
    quantity,
    unit_price
) VALUES 
    (0, 0, 0, 1, 999.99); 

-- Create and populate reviews table
INSERT INTO review (
    review_id,
    product_id,
    rating,
    comment
) VALUES 
    (0, 0, 5, 'Great');