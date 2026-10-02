import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, closeSync, openSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = mkdtempSync(join(tmpdir(), 'locaded-payments-'));
process.env.DATABASE_URL = `file:${join(directory, 'test.db')}`;
closeSync(openSync(join(directory, 'test.db'), 'ax'));
const setup = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env: process.env, encoding: 'utf8' });
assert.equal(setup.status, 0, setup.stderr);
const { prisma } = await import('../src/lib/prisma.ts');
const { POST: sell, GET: search } = await import('../src/app/api/pos/transaccion/route.ts');
const { POST: checkout } = await import('../src/app/api/checkout/route.ts');
const { POST: startTap } = await import('../src/app/api/payments/contactless/route.ts');
const { GET: readTap, POST: respondTap } = await import('../src/app/api/payments/contactless/[id]/route.ts');

const request = (path, body) => new Request(`http://localhost:3000${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const context = id => ({ params: Promise.resolve({ id }) });
async function payload(method = 'contactless', price = 1234.56) {
  const vehicle = await prisma.vehiculo.create({ data: { marca: 'Porsche', modelo: `Prueba ${crypto.randomUUID()}`, anio: 2026, precio: price, tipo: 'deportivo' } });
  return { vehiculoId: vehicle.id, cliente: { nombre: 'Comprador prueba', correo: 'comprador@prueba.test' }, modalidad: 'contado', metodoPago: method, montoTotal: price, montoRecibido: price, vendedorNombre: 'Asesor prueba' };
}
after(async () => { await prisma.$disconnect(); rmSync(directory, { recursive: true, force: true }); });

test('Tap persists across processes and approval records a single searchable receipt without an open POS', async () => {
  const sale = await payload();
  const created = await startTap(request('/api/payments/contactless', sale));
  assert.equal(created.status, 200);
  const { data: session } = await created.json();
  assert.equal(session.amount, sale.montoTotal);
  assert.equal(session.status, 'pending');
  assert.equal(session.salePayload, undefined);
  const restarted = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `const {getContactlessSession}=await import('./src/lib/contactless-sim.ts'); const s=await getContactlessSession(${JSON.stringify(session.id)}); console.log(JSON.stringify(s)); const {prisma}=await import('./src/lib/prisma.ts'); await prisma.$disconnect();`], { env: process.env, encoding: 'utf8' });
  assert.equal(restarted.status, 0, restarted.stderr);
  assert.equal(JSON.parse(restarted.stdout.trim()).status, 'pending');
  const approve = () => respondTap(request(`/api/payments/contactless/${session.id}`, { action: 'approve' }), context(session.id));
  const approved = await approve(); assert.equal(approved.status, 200);
  const { data } = await approved.json();
  assert.equal(data.status, 'approved'); assert.equal(data.receipt.montoTotal, sale.montoTotal);
  const retry = await approve(); assert.equal((await retry.json()).data.transaccionId, data.transaccionId);
  assert.equal(await prisma.transaccion.count({ where: { vehiculoId: sale.vehiculoId } }), 1);
  assert.equal((await prisma.vehiculo.findUnique({ where: { id: sale.vehiculoId } })).estado, 'vendido');
  const snapshot = await readTap(new Request('http://localhost'), context(session.id));
  assert.equal((await snapshot.json()).data.receipt.folio, data.receipt.folio);
  for (const query of [data.receipt.folio, 'COMPRADOR@PRUEBA.TEST', 'Comprador prueba', 'Porsche']) {
    const found = await search(new Request(`http://localhost/api/pos/transaccion?q=${encodeURIComponent(query)}`));
    const results = await found.json(); assert.ok(results.data.some(row => row.id === data.transaccionId), query);
    assert.equal(JSON.stringify(results).includes('contrasena'), false);
  }
});

test('declined, expired, forged amounts and direct contactless calls never register a sale', async () => {
  const sale = await payload();
  assert.equal((await startTap(request('/api/payments/contactless', { ...sale, montoTotal: 1 }))).status, 422);
  assert.equal((await sell(request('/api/pos/transaccion', sale))).status, 422);
  for (const expired of [false, true]) {
    const { data: session } = await (await startTap(request('/api/payments/contactless', sale))).json();
    if (expired) await prisma.contactlessSession.update({ where: { id: session.id }, data: { expiresAt: new Date(0) } });
    const response = await respondTap(request('/api/payments/contactless/id', { action: expired ? 'approve' : 'decline' }), context(session.id));
    assert.equal((await response.json()).data.status, expired ? 'expired' : 'declined');
  }
  assert.equal(await prisma.transaccion.count({ where: { vehiculoId: sale.vehiculoId } }), 0);
});

test('approval conflict rolls back its status and never issues an approved receipt', async () => {
  const sale = await payload();
  const { data: session } = await (await startTap(request('/api/payments/contactless', sale))).json();
  await prisma.vehiculo.update({ where: { id: sale.vehiculoId }, data: { estado: 'vendido' } });
  assert.equal((await respondTap(request('/tap', { action: 'approve' }), context(session.id))).status, 409);
  assert.equal((await prisma.contactlessSession.findUnique({ where: { id: session.id } })).status, 'pending');
  assert.equal(await prisma.transaccion.count({ where: { vehiculoId: sale.vehiculoId } }), 0);
});

test('web deposit uses server price, keeps apartado state and saves its receipt', async () => {
  const sale = await payload('spei', 1234.56);
  const body = { vehiculoId: sale.vehiculoId, nombre: 'Comprador web', correo: 'web@prueba.test', ciudad: 'CDMX', modalidad: 'Apartado de Chasis (10% de Anticipo)', metodoPago: 'Transferencia Interbancaria SPEI', montoTotal: 123.46 };
  assert.equal((await checkout(request('/api/checkout', { ...body, montoTotal: 1 }))).status, 422);
  const response = await checkout(request('/api/checkout', body)); assert.equal(response.status, 200);
  const receipt = await response.json(); assert.equal(receipt.montoTotal, 123.46);
  assert.equal((await prisma.vehiculo.findUnique({ where: { id: sale.vehiculoId } })).estado, 'apartado');
  assert.equal((await prisma.transaccion.findUnique({ where: { id: receipt.transaccionId } })).metodoPago, 'spei');
  assert.equal((await checkout(request('/api/checkout', body))).status, 409);
});

test('cash change is preserved and empty searches return an empty result', async () => {
  const sale = await payload('efectivo', 1000);
  const response = await sell(request('/api/pos/transaccion', { ...sale, montoRecibido: 1500 }));
  const { data } = await response.json(); assert.equal(data.cambio, 500);
  const found = await search(new Request(`http://localhost/api/pos/transaccion?q=${data.folio}`));
  assert.equal((await found.json()).data[0].receipt.cambio, 500);
  const empty = await search(new Request('http://localhost/api/pos/transaccion?q=does-not-exist'));
  assert.deepEqual((await empty.json()).data, []);
});
