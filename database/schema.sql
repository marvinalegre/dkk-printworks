DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    jwt_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_reference_number TEXT NOT NULL UNIQUE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK( status IN ('New', 'Pending', 'In Progress', 'Completed', 'Cancelled') ) NOT NULL DEFAULT 'New', 
    special_instructions TEXT,                          
    total_price DECIMAL(10, 2) NOT NULL,                 
    FOREIGN KEY (user_id) REFERENCES users(user_id),    
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    order_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    internal_file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    num_pages INTEGER NOT NULL,
    file_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

DROP TABLE IF EXISTS page_ranges;
CREATE TABLE page_ranges (
    page_range_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    page_range TEXT NOT NULL,
    copies INTEGER NOT NULL DEFAULT 1,                 
    paper_size TEXT CHECK( paper_size IN ('A4', 'Short', 'Long') ) NOT NULL DEFAULT 'Short',  
    color TEXT CHECK( color IN ('Colored', 'Black & White') ) NOT NULL DEFAULT 'Black & White', 
    duplex TEXT CHECK( duplex IN ('Single-sided', 'Double-sided') ) NOT NULL DEFAULT 'Single-sided',
    page_range_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(file_id)
);
