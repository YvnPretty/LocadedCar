import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePayment, validateRequest } from './payment';

test('full payment, discount and deposits retain correct inventory state', () => {
  assert.deepEqual(calculatePayment(1000, 'contado', 100, 0), { total: 900, balance: 900, state: 'vendido' });
  assert.deepEqual(calculatePayment(1000, 'apartado_10', 0, 0), { total: 100, balance: 1000, state: 'apartado' });
  assert.equal(calculatePayment(1000, 'personalizado', 0, 200).state, 'apartado');
  assert.equal(calculatePayment(1000, 'personalizado', 0, 1000).state, 'vendido');
});
test('invalid amounts cannot become full-price sales', () => {
  for (const amount of [0, -1, NaN, Infinity, 1001]) assert.throws(() => calculatePayment(1000, 'personalizado', 0, amount));
  for (const discount of [-1, 1000, Infinity]) assert.throws(() => calculatePayment(1000, 'contado', discount, 0));
});
test('reject malformed requests and buyer data', () => {
  for (const body of [null, [], {}, { cliente: { nombre: 'A', correo: 'invalid' } }]) assert.throws(() => validateRequest(body));
});
