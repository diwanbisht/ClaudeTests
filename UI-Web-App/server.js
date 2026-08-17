// Zero-dependency static file server for the UI-Web-App playground.
// Any unmapped path (e.g. /this-page-does-not-exist, /images/non-existent-logo.png)
// naturally 404s, which the page relies on for its broken-link/broken-image demos.
const http = require('http');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 5500;
const ROOT = __dirname;

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'test_automation',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function handleApi(req, res, pathname) {
  const isCollection = pathname === '/api/users';
  const itemMatch = pathname.match(/^\/api\/users\/([^/]+)$/);

  try {
    if (isCollection && req.method === 'GET') {
      const [rows] = await getPool().query('SELECT id, name, email, role FROM app_users ORDER BY id ASC');
      return sendJson(res, 200, rows);
    }

    if (isCollection && req.method === 'POST') {
      const conn = await getPool().getConnection();
      try {
        await conn.beginTransaction();
        const placeholderEmail = `pending-${Date.now()}@placeholder.local`;
        const [insertResult] = await conn.query(
          'INSERT INTO app_users (name, email, role) VALUES (?, ?, ?)',
          ['New User', placeholderEmail, 'Guest'],
        );
        const id = insertResult.insertId;
        await conn.query('UPDATE app_users SET name = ?, email = ? WHERE id = ?', [
          `New User ${id}`,
          `newuser${id}@example.com`,
          id,
        ]);
        const [rows] = await conn.query('SELECT id, name, email, role FROM app_users WHERE id = ?', [id]);
        await conn.commit();
        return sendJson(res, 201, rows[0]);
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    if (itemMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
      const id = Number(itemMatch[1]);
      if (!Number.isInteger(id) || id <= 0) {
        return sendJson(res, 400, { error: 'Invalid user id' });
      }

      if (req.method === 'DELETE') {
        const [result] = await getPool().query('DELETE FROM app_users WHERE id = ?', [id]);
        if (result.affectedRows === 0) return sendJson(res, 404, { error: `User ${id} not found` });
        return sendJson(res, 200, { id, deleted: true });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON body' });
      }
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!name || !email) {
        return sendJson(res, 400, { error: 'name and email are required' });
      }

      const [result] = await getPool().query('UPDATE app_users SET name = ?, email = ? WHERE id = ?', [
        name,
        email,
        id,
      ]);
      if (result.affectedRows === 0) return sendJson(res, 404, { error: `User ${id} not found` });
      const [rows] = await getPool().query('SELECT id, name, email, role FROM app_users WHERE id = ?', [id]);
      return sendJson(res, 200, rows[0]);
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return sendJson(res, 409, { error: 'Email already in use' });
    }
    console.error('API error:', err);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath.startsWith('/api/')) {
    handleApi(req, res, urlPath);
    return;
  }

  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(ROOT, relativePath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`UI-Web-App running at http://localhost:${PORT}`);
});
