PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, hashed_password TEXT, jwt_id TEXT UNIQUE);
CREATE TABLE uploads (id INTEGER PRIMARY KEY, file_name TEXT UNIQUE, user_id INTEGER, FOREIGN KEY (user_id) REFERENCES users(id));
