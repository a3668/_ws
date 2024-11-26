import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("data.db");

// 初始化表結構
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(username) REFERENCES users(username)
  )
`);

export function createUser(username, password) {
  const existingUser = [...db.query("SELECT 1 FROM users WHERE username = ?", [username])];
  if (existingUser.length > 0) {
    throw new Error("用戶名已存在");
  }
  db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
}

export function findUser(username, password) {
  const user = [...db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password])];
  return user[0];
}

export function saveScore(username, score) {
  const userExists = [...db.query("SELECT 1 FROM users WHERE username = ?", [username])];
  if (userExists.length === 0) {
    throw new Error("用戶不存在");
  }
  db.query("INSERT INTO scores (username, score) VALUES (?, ?)", [username, score]);
}

export function getTopScores(limit = 10) {
  return [...db.query("SELECT username, score, timestamp FROM scores ORDER BY score DESC, timestamp ASC LIMIT ?", [limit])];
}