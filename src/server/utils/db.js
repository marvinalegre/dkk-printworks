import Database from "better-sqlite3";

export async function createNewOrder(userId, orderRefNumber) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const info = db
    .prepare(
      "insert into orders (user_id, order_reference_number, status, special_instructions, total_price) values (?, ?, ?, ?, ?)"
    )
    .run(userId, orderRefNumber, "n", null, 0);

  if (info.changes !== 1) throw "new order was not created";

  db.close();
}

export async function getNewOrder(userId) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const output = db
    .prepare(
      `
      select order_reference_number, file_name, num_pages, page_range, copies, color, paper_size from orders
      left join files on orders.order_id = files.order_id
      left join page_ranges on files.file_id = page_ranges.file_id
      where orders.status = 'n'
      and user_id = ?
      order by file_timestamp, page_range_timestamp;
      `
    )
    .bind(userId)
    .all();

  db.close();

  return output;
}

export async function getUserId(jwtId) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const row = db
    .prepare("select user_id from users where jwt_id = ?")
    .get(jwtId);

  db.close();

  return row?.user_id;
}

export async function getUsername(jwtId) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const row = db
    .prepare("select username from users where jwt_id = ?")
    .get(jwtId);

  db.close();

  return row.username;
}

export async function getHashAndJwtId(username) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const row = db
    .prepare("select password_hash, jwt_id from users where username = ?")
    .get(username);

  db.close();

  if (!row) return null;
  return {
    passwordHash: row.password_hash,
    jwtId: row.jwt_id,
  };
}

export async function insertUser(username, passwordHash, jwtId) {
  const db = new Database(`${process.cwd()}/db.sql`);
  db.pragma("journal_mode = WAL");

  const info = db
    .prepare(
      "insert into users (username, password_hash, jwt_id) values (?, ?, ?)"
    )
    .run(username, passwordHash, jwtId);

  if (info.changes !== 1) throw "user was not inserted";

  db.close();
}
