// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB);

// Promisify convenience
const dbAll = (sql, params=[]) => new Promise((res, rej) => db.all(sql, params, (e, r) => e ? rej(e) : res(r)));
const dbGet = (sql, params=[]) => new Promise((res, rej) => db.get(sql, params, (e, r) => e ? rej(e) : res(r)));
const dbRun = (sql, params=[]) => new Promise((res, rej) => db.run(sql, params, function(e) { if (e) rej(e); else res({ lastID: this.lastID, changes: this.changes }); }));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// List transactions (latest first)
app.get('/api/transactions', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM transactions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'db error' });
  }
});

// Create transaction (used by both customer & admin flows)
app.post('/api/transactions', async (req, res) => {
  try {
    const { date, customer, mobile, table_no, method, amount } = req.body;
    if (!date || !customer) return res.status(400).json({ error: 'date and customer required' });
    const result = await dbRun(
      `INSERT INTO transactions (date, customer, mobile, table_no, method, amount) VALUES (?, ?, ?, ?, ?, ?)`,
      [date, customer, mobile || '', table_no || null, method || '', amount || 0]
    );
    const created = await dbGet('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'db error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
