// init_db.js — run once: npm run init-db
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      customer TEXT NOT NULL,
      mobile TEXT,
      table_no INTEGER,
      method TEXT,
      amount REAL
    );
  `, (err) => {
    if (err) console.error(err);
    else console.log('transactions table ensured.');
  });
});

db.close();
