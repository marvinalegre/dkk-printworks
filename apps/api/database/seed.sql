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
    created_at TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    updated_at TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    role_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_reference_number TEXT NOT NULL UNIQUE,
    order_date TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    -- n, New | pe, Pending | pr, In Progress | co, Completed | ca, Cancelled
    status TEXT CHECK( status IN ('n', 'pe', 'pr', 'co', 'ca') ) NOT NULL DEFAULT 'n', 
    special_instructions TEXT,                          
    total_price DECIMAL(10, 2) NOT NULL,                 
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    order_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    internal_file_name TEXT NOT NULL UNIQUE,
    file_size INTEGER NOT NULL,
    num_pages INTEGER NOT NULL,
    -- 0.66 to 1
    -- sample entry: '1,2-5,7,9'
    full_color_pages TEXT,
    -- 0.33 to 0.66
    mid_color_pages TEXT,
    -- 0.01 to 0.33
    spot_color_pages TEXT,
    file_timestamp TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

DROP TABLE IF EXISTS page_ranges;
CREATE TABLE page_ranges (
    page_range_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    page_range TEXT NOT NULL,
    copies INTEGER NOT NULL DEFAULT 1,
    -- a, A4 | s, Short | l, Long
    paper_size TEXT CHECK( paper_size IN ('a', 's', 'l') ) NOT NULL DEFAULT 's',
    -- c, Colored | b, Black and White
    color TEXT CHECK( color IN ('c', 'b') ) NOT NULL DEFAULT 'b', 
    -- s, Single-sided | d, Double-sided
    duplex TEXT CHECK( duplex IN ('s', 'd') ) NOT NULL DEFAULT 's',
    page_range_timestamp TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    FOREIGN KEY (file_id) REFERENCES files(file_id)
);

DROP TABLE IF EXISTS file_upload_error_messages;
CREATE TABLE file_upload_error_messages (
    fuerr_message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    fuerr_message TEXT NOT NULL,
    seen TEXT CHECK( seen IN ('y', 'n') ) NOT NULL DEFAULT 'n'
);


INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Registered User'),
(2, 'Admin'),
(3, 'Super Admin');

INSERT INTO users (jwt_id, username, display_name, email, password_hash, role_id, created_at, updated_at) VALUES 
('u-1a1aae2b-27fd-4ab0-98b7-6eac99b8d4bd', 'marvin', NULL, NULL, '$2a$08$l6OdwGLE.MIcDRd8f2ZB9OyQejLdBP3ImCg.TWpmiAs.tZM22stxm', 3, '2024-11-15 08:52:18', '2024-11-15 08:52:18'),
('u-b703d125-f4b4-42b0-bfb1-a6aa24a40887', 'donna', NULL, NULL, '$2a$08$l6OdwGLE.MIcDRd8f2ZB9OyQejLdBP3ImCg.TWpmiAs.tZM22stxm', 2, '2024-11-15 08:52:18', '2024-11-15 08:52:18'),
('u-e9ca0563-8e9c-430e-90fe-fc854b5e9d3d', 'kate', NULL, NULL, '$2a$08$l6OdwGLE.MIcDRd8f2ZB9OyQejLdBP3ImCg.TWpmiAs.tZM22stxm', 2, '2024-11-15 08:52:18', '2024-11-15 08:52:18'),
('u-e4847ee7-5095-4358-885c-c65b04a801a1', 'kath', NULL, NULL, '$2a$08$l6OdwGLE.MIcDRd8f2ZB9OyQejLdBP3ImCg.TWpmiAs.tZM22stxm', 2, '2024-11-15 08:52:18', '2024-11-15 08:52:18'),
('u-4c5084ef-557c-441b-8ac0-fe7f31744422', 'thea', NULL, NULL, '$2a$08$l6OdwGLE.MIcDRd8f2ZB9OyQejLdBP3ImCg.TWpmiAs.tZM22stxm', 2, '2024-11-15 08:52:18', '2024-11-15 08:52:18');

INSERT INTO orders (user_id, order_reference_number, status, special_instructions, total_price, order_date) VALUES 
-- total_price was computed at 3pesos per page (short)
(1, 'o-d1e12406-996e-4266-a62d-21940568fa73', 'n', NULL, 6, '2024-11-15 08:56:48');

INSERT INTO files (order_id, file_name, internal_file_name, file_size, num_pages, file_timestamp, full_color_pages, mid_color_pages, spot_color_pages) VALUES 
(1, 'resumé.pdf', 'fooa8f01312f4df940567c800', 62385, 1, '2024-11-15 08:58:00', NULL, NULL, '1');

INSERT INTO page_ranges (file_id, page_range, copies, paper_size, color, duplex, page_range_timestamp) VALUES 
(1, '1', 2, 's', 'b', 's', '2024-11-15 08:58:00');

INSERT INTO file_upload_error_messages (user_id, fuerr_message) VALUES
(1, 'please upload a pdf document');
