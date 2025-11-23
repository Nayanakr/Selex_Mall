// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto'); // FIXED: replaces uuid library

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'data', 'db.json');