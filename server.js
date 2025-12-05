// server.js (robust version for Railway)
const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
app.use(express.json());

// --- Logging helper (always prints to stdout for Railway) ---
function log(...args) {
  console.log('[server]', ...args);
}

// --- DB path and ensure directory exists ---
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      log('Created data directory at', DATA_DIR);
    }
  } catch (err) {
    log('Failed to ensure data directory:', err);
    // Let errors surface when reading/writing DB
  }
}

function readDB() {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_PATH)) {
      const init = { shops: [], employees: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2), 'utf8');
      log('Created initial db.json');
      return init;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '{"shops":[],"employees":[]}');
  } catch (err) {
    log('Error reading DB:', err);
    // throw so upstream handler sends 500
    throw err;
  }
}

function writeDB(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    log('DB written to', DB_PATH);
  } catch (err) {
    log('Error writing DB:', err);
    throw err;
  }
}

/* -----------------------
   MIDDLEWARE: request logging + error handling
------------------------- */
app.use((req, res, next) => {
  // simple logger
  log(req.method, req.path);
  next();
});

// Basic static for frontend
app.use(express.static(path.join(__dirname, 'public')));

/* -----------------------
   SHOPS CRUD
------------------------- */

app.get('/api/shops', (req, res) => {
  try {
    const db = readDB();
    const q = req.query.q ? req.query.q.toLowerCase() : null;

    let result = db.shops;
    if (q) {
      result = result.filter(
        s =>
          (s.name || '').toLowerCase().includes(q) ||
          ((s.category || '').toLowerCase().includes(q))
      );
    }

    res.json(result);
  } catch (err) {
    log('GET /api/shops failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/shops/:id', (req, res) => {
  try {
    const db = readDB();
    const shop = db.shops.find(s => s.id === req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    log('GET /api/shops/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/shops', (req, res) => {
  try {
    const db = readDB();
    const { name, category, location, phone } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const shop = {
      id: 'shop_' + randomUUID(),
      name,
      category: category || '',
      location: location || '',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    db.shops.push(shop);
    writeDB(db);

    res.status(201).json(shop);
  } catch (err) {
    log('POST /api/shops failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/shops/:id', (req, res) => {
  try {
    const db = readDB();
    const idx = db.shops.findIndex(s => s.id === req.params.id);

    if (idx === -1) return res.status(404).json({ error: 'Shop not found' });

    db.shops[idx] = { ...db.shops[idx], ...req.body };
    writeDB(db);

    res.json(db.shops[idx]);
  } catch (err) {
    log('PUT /api/shops/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/shops/:id', (req, res) => {
  try {
    const db = readDB();
    const shopId = req.params.id;

    db.shops = db.shops.filter(s => s.id !== shopId);
    db.employees = db.employees.filter(e => e.shopId !== shopId);

    writeDB(db);
    res.status(204).end();
  } catch (err) {
    log('DELETE /api/shops/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* -----------------------
   EMPLOYEES CRUD
------------------------- */

app.get('/api/employees', (req, res) => {
  try {
    const db = readDB();
    const shopId = req.query.shopId;

    let result = db.employees;
    if (shopId) result = result.filter(e => e.shopId === shopId);

    res.json(result);
  } catch (err) {
    log('GET /api/employees failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/employees/:id', (req, res) => {
  try {
    const db = readDB();
    const emp = db.employees.find(e => e.id === req.params.id);

    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    res.json(emp);
  } catch (err) {
    log('GET /api/employees/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/employees', (req, res) => {
  try {
    const db = readDB();
    const { firstName, lastName, role, shopId, email } = req.body;

    if (!firstName || !lastName)
      return res.status(400).json({ error: 'firstName and lastName required' });

    const emp = {
      id: 'emp_' + randomUUID(),
      firstName,
      lastName,
      role: role || '',
      shopId: shopId || null,
      email: email || ''
    };

    db.employees.push(emp);
    writeDB(db);

    res.status(201).json(emp);
  } catch (err) {
    log('POST /api/employees failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/employees/:id', (req, res) => {
  try {
    const db = readDB();
    const idx = db.employees.findIndex(e => e.id === req.params.id);

    if (idx === -1) return res.status(404).json({ error: 'Employee not found' });

    db.employees[idx] = { ...db.employees[idx], ...req.body };
    writeDB(db);

    res.json(db.employees[idx]);
  } catch (err) {
    log('PUT /api/employees/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  try {
    const db = readDB();
    db.employees = db.employees.filter(e => e.id !== req.params.id);
    writeDB(db);

    res.status(204).end();
  } catch (err) {
    log('DELETE /api/employees/:id failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* -----------------------
   SHOP → EMPLOYEES RELATION
------------------------- */

app.get('/api/shops/:id/employees', (req, res) => {
  try {
    const db = readDB();
    const shopId = req.params.id;

    const employees = db.employees.filter(e => e.shopId === shopId);
    res.json(employees);
  } catch (err) {
    log('GET /api/shops/:id/employees failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* -----------------------
   HEALTH CHECK
------------------------- */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* -----------------------
   START SERVER
------------------------- */

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    log(`Selex Mall API running at http://localhost:${PORT}`);
  });
}

module.exports = app; // For tests
