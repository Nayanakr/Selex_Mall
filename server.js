// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto'); // FIXED: replaces uuid library

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// --- Helpers ---
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ shops: [], employees: [] }, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw || '{"shops":[],"employees":[]}');
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/* -----------------------
   SHOPS CRUD
------------------------- */

app.get('/api/shops', (req, res) => {
  const db = readDB();
  const q = req.query.q ? req.query.q.toLowerCase() : null;
let result = db.shops;
  if (q) {
    result = result.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
    );
  }
   res.json(result);
});
app.get('/api/shops/:id', (req, res) => {
  const db = readDB();
  const shop = db.shops.find(s => s.id === req.params.id);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json(shop);
});
app.post('/api/shops', (req, res) => {
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

