-- Roles Table
CREATE TABLE roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL UNIQUE
);

-- Users Table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    jwt_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,        -- Username must also be unique
    display_name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Phone Numbers Table
CREATE TABLE phone_numbers (
    phone_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Profile Pictures Table
CREATE TABLE profile_pictures (
    picture_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    picture_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE uploads (
    upload_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique identifier for each file upload
    user_id INTEGER NOT NULL,                      -- User who uploaded the file (foreign key)
    file_name TEXT NOT NULL,                       -- Original file name
    file_path TEXT NOT NULL,                       -- Path to the file (could be a URL or file system path)
    file_size INTEGER NOT NULL,                    -- Size of the file in bytes
    file_type TEXT NOT NULL,                       -- File extension or MIME type (e.g., 'image/jpeg')
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of the upload
    FOREIGN KEY (user_id) REFERENCES users(user_id)  -- Foreign key referencing the users table
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,         -- Unique identifier for the order
    user_id INTEGER NOT NULL,                           -- User who placed the order (foreign key)
    upload_id INTEGER NOT NULL,                         -- Reference to the file being printed (foreign key from uploads table)
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Date and time when the order was placed
    quantity INTEGER NOT NULL DEFAULT 1,                 -- Number of copies to print
    paper_size ENUM('A4', 'Short', 'Long') DEFAULT 'Short',  -- Paper size for printing
    color_mode ENUM('Color', 'Black & White') DEFAULT 'Black & White', -- Print color mode
    duplex ENUM('Single-sided', 'Double-sided') DEFAULT 'Single-sided', -- Duplex printing (optional)
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending', -- Order status
    special_instructions TEXT,                          -- Optional instructions from the customer (e.g., custom settings)
    total_price DECIMAL(10, 2) NOT NULL,                 -- Total price of the order
    FOREIGN KEY (user_id) REFERENCES users(user_id),    -- Foreign key referencing the users table
    FOREIGN KEY (upload_id) REFERENCES uploads(upload_id) -- Foreign key referencing the uploads table
);
