// tests/shops.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

beforeEach(() => {
  // reset DB to known state
  const seed = { shops: [], employees: [] };
  fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
});

afterAll(() => {
  // optional cleanup
});

describe('Shops & Employees API', () => {
  test('create shop and fetch it', async () => {
    const res = await request(app).post('/api/shops').send({ name: 'Test Shop', category: 'Retail' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Shop');

    const get = await request(app).get('/api/shops/' + res.body.id);
    expect(get.statusCode).toBe(200);
    expect(get.body.category).toBe('Retail');
  });

  test('create employee assigned to shop and fetch by shop', async () => {
    const s = await request(app).post('/api/shops').send({ name: 'Shop A' });
    const shopId = s.body.id;
    const e = await request(app).post('/api/employees').send({ firstName: 'Sam', lastName: 'Lee', shopId });
    expect(e.statusCode).toBe(201);
    const emps = await request(app).get(`/api/shops/${shopId}/employees`);
    expect(Array.isArray(emps.body)).toBe(true);
    expect(emps.body.length).toBe(1);
    expect(emps.body[0].firstName).toBe('Sam');
  });
});
