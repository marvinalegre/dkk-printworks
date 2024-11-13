import Database from "better-sqlite3";

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
