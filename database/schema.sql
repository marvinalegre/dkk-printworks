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

DROP TABLE IF EXISTS phone_numbers;
CREATE TABLE phone_numbers (
    phone_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DROP TABLE IF EXISTS profile_pictures;
CREATE TABLE profile_pictures (
    picture_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    picture_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DROP TABLE IF EXISTS uploads;
CREATE TABLE uploads (
    upload_id INTEGER PRIMARY KEY AUTOINCREMENT,  
    user_id INTEGER NOT NULL,                      
    file_name TEXT NOT NULL,                       
    file_path TEXT NOT NULL,                       
    file_size INTEGER NOT NULL,                    
    file_type TEXT NOT NULL,                       
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES users(user_id)  
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,         
    user_id INTEGER NOT NULL,                           
    upload_id INTEGER NOT NULL,                         
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     
    quantity INTEGER NOT NULL DEFAULT 1,                 
    paper_size TEXT CHECK( paper_size IN ('A4', 'Short', 'Long') ) NOT NULL DEFAULT 'Short',  
    color_mode TEXT CHECK( color_mode IN ('Color', 'Black & White') ) NOT NULL DEFAULT 'Black & White', 
    duplex TEXT CHECK( duplex IN ('Single-sided', 'Double-sided') ) NOT NULL DEFAULT 'Single-sided', 
    status TEXT CHECK( status IN ('Pending', 'In Progress', 'Completed', 'Cancelled') ) NOT NULL DEFAULT 'Pending', 
    special_instructions TEXT,                          
    total_price DECIMAL(10, 2) NOT NULL,                 
    FOREIGN KEY (user_id) REFERENCES users(user_id),    
    FOREIGN KEY (upload_id) REFERENCES uploads(upload_id) 
);
