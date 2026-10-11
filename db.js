const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "lab4"
});

const USER_COLUMNS = "id, name, username, email, password_hash, bio, to_char(created_at, 'YYYY-MM-DD') AS created_at";

async function findUserById(id) {
  const result = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findUserByEmail(email) {
  const result = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

async function findUserByUsername(username) {
  const result = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE LOWER(username) = LOWER($1)`, [username]);
  return result.rows[0] || null;
}

async function createUser({ name, username, email, passwordHash }) {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, username, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING ${USER_COLUMNS}`,
      [name, username, email, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") return null;
    throw error;
  }
}

async function updateProfile(id, { name, bio }) {
  await pool.query("UPDATE users SET name = $1, bio = $2 WHERE id = $3", [name, bio, id]);
}

async function createSession(token, userId, days) {
  await pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + make_interval(days => $3))",
    [token, userId, days]
  );
}

async function findSession(token) {
  const result = await pool.query("SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()", [token]);
  return result.rows[0] || null;
}

async function deleteSession(token) {
  await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
}

async function checkConnection() {
  await pool.query("SELECT 1 FROM users LIMIT 1");
}

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  createUser,
  updateProfile,
  createSession,
  findSession,
  deleteSession,
  checkConnection
};
