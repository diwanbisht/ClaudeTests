// Minimal local practice app used by TextInputsPage/WebTablePage specs.
// Serves the static Elements page from ./public plus a small /api/users
// REST API backed by the `app_users` MySQL table. Started by Playwright's
// webServer (see playwright.config.ts) before the test run.
const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 5500;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test_automation',
  waitForConnections: true,
  connectionLimit: 10,
});

async function ensureSeeded() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      role VARCHAR(50) NOT NULL
    )
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM app_users');
  if (rows[0].count === 0) {
    await pool.query('INSERT INTO app_users (name, email, role) VALUES ?', [
      [
        ['Ada Lovelace', 'ada@example.com', 'Admin'],
        ['Grace Hopper', 'grace@example.com', 'Editor'],
        ['Alan Turing', 'alan@example.com', 'Viewer'],
      ],
    ]);
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM app_users ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO app_users (name, email, role) VALUES ('', '', 'Guest')",
    );
    const id = result.insertId;
    const name = `New User ${id}`;
    const email = `newuser${id}@example.com`;
    await pool.query('UPDATE app_users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.status(201).json({ id, name, email, role: 'Guest' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;
  try {
    await pool.query('UPDATE app_users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    const [rows] = await pool.query('SELECT id, name, email, role FROM app_users WHERE id = ?', [
      id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

ensureSeeded()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ui-app listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize ui-app database', error);
    process.exit(1);
  });
