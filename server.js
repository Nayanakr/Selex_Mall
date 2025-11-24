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