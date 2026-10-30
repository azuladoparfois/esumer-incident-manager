import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const id = '507f1f77bcf86cd799439011';
function fixture() {
  const items = new Map();
  const service = {
    async create(data) { const item = { id, category: 'other', priority: 'medium', status: 'open', ...data }; items.set(id, item); return item; },
    async get(key) { return items.get(key); },
    async update(key, data) { if (!items.has(key)) return null; const item = { ...items.get(key), ...data }; items.set(key, item); return item; },
    async remove(key) { const item = items.get(key); items.delete(key); return item; },
    async list() { return { items: [...items.values()], pagination: { page: 1, limit: 10, total: items.size, totalPages: items.size ? 1 : 0 } }; }
  };
  return createApp({ service, ready: async () => true, origins: ['http://localhost:5173'] });
}
test('CRUD HTTP, validación y errores', async () => {
  const app = fixture();
  const created = await request(app).post('/api/incidents').send({ title: 'Fallo de red', description: 'No hay conexión' }).expect(201);
  assert.equal(created.body.id, id); assert.equal(created.body.status, 'open');
  await request(app).post('/api/incidents').send({ title: ' ', description: 'x', priority: 'urgent' }).expect(422);
  await request(app).patch(`/api/incidents/${id}`).send({}).expect(422);
  await request(app).get('/api/incidents?limit=0').expect(422);
  await request(app).get('/api/incidents/invalid').expect(400);
  await request(app).get('/api/incidents/507f1f77bcf86cd799439012').expect(404);
  const updated = await request(app).patch(`/api/incidents/${id}`).send({ status: 'resolved' }).expect(200);
  assert.equal(updated.body.status, 'resolved');
  await request(app).get(`/api/incidents/${id}`).expect(200);
  await request(app).get('/api/incidents').expect(200);
  const deleted = await request(app).delete(`/api/incidents/${id}`).expect(204);
  assert.equal(deleted.text, '');
  await request(app).get(`/api/incidents/${id}`).expect(404);
});
test('salud, documentación y CORS', async () => {
  const app = fixture();
  await request(app).get('/health/live').expect(200, { status: 'ok' });
  await request(app).get('/health/ready').expect(200, { status: 'ok' });
  await request(createApp({ ready: async () => false })).get('/health/ready').expect(503, { status: 'unavailable' });
  await request(createApp({ ready: async () => { throw new Error('offline'); } })).get('/health/ready').expect(503);
  const spec = await request(app).get('/openapi.json').expect(200);
  assert.equal(spec.body.openapi, '3.0.3');
  for (const path of ['/api/incidents', '/api/incidents/{id}', '/health/live', '/health/ready']) assert.ok(spec.body.paths[path]);
  await request(app).get('/api-docs/').expect(200);
  const allowed = await request(app).get('/health/live').set('Origin', 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  const denied = await request(app).get('/health/live').set('Origin', 'http://other.example');
  assert.equal(denied.headers['access-control-allow-origin'], undefined);
});
