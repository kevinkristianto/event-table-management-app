const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS layouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    menu TEXT,
    allergies TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS seat_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER,
    layout_id INTEGER,
    seat_id TEXT,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (layout_id) REFERENCES layouts(id)
  )`);
});

module.exports = db;
