import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactlessSession, updateContactlessSession, requireApprovedContactlessSession, consumeContactlessSession, getContactlessSession } from './contactless-sim';
import { POST } from '../app/api/payments/contactless/route';

test('only an approved session for the same vehicle and amount authorizes a sale', () => {
  const session = createContactlessSession(1000, 'Auto demo', 'car-1');
  assert.throws(() => requireApprovedContactlessSession('', 'car-1', 1000));
  assert.throws(() => requireApprovedContactlessSession(session.id, 'car-1', 1000));
  updateContactlessSession(session.id, 'approved');
  assert.throws(() => requireApprovedContactlessSession(session.id, 'car-2', 1000));
  assert.throws(() => requireApprovedContactlessSession(session.id, 'car-1', 999));
  assert.doesNotThrow(() => requireApprovedContactlessSession(session.id, 'car-1', 1000));
  consumeContactlessSession(session.id);
  assert.throws(() => requireApprovedContactlessSession(session.id, 'car-1', 1000));
});

test('declined sessions cannot subsequently be approved', () => {
  const session = createContactlessSession(100, 'Auto', 'car-1');
  updateContactlessSession(session.id, 'declined');
  assert.equal(updateContactlessSession(session.id, 'approved')?.status, 'declined');
  assert.throws(() => requireApprovedContactlessSession(session.id, 'car-1', 100));
});

test('pending and approved sessions expire exactly at their deadline', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 100000 });
  const pending = createContactlessSession(100, 'Auto', 'car-1');
  const approved = createContactlessSession(100, 'Auto', 'car-1');
  updateContactlessSession(approved.id, 'approved');
  t.mock.timers.tick(10 * 60 * 1000);
  assert.equal(getContactlessSession(pending.id)?.status, 'expired');
  assert.throws(() => requireApprovedContactlessSession(approved.id, 'car-1', 100));
});

test('session endpoint rejects malformed JSON and invalid amounts', async () => {
  for (const [body, status] of [['{', 400], ['null', 422], ['[]', 422], [JSON.stringify({amount: true, vehicle: 'Auto', vehicleId: 'car-1'}), 422], [JSON.stringify({amount: 0.001, vehicle: 'Auto', vehicleId: 'car-1'}), 422], [JSON.stringify({amount: 100, vehicle: 'Auto'}), 422]] as const) {
    const response = await POST(new Request('http://localhost/api/payments/contactless', {method: 'POST', body}));
    assert.equal(response.status, status);
  }
  const response = await POST(new Request('http://localhost/api/payments/contactless', {method: 'POST', body: JSON.stringify({ amount: 100, vehicle: 'Auto', vehicleId: 'car-1' })}));
  assert.equal(response.status, 200);
  const {data} = await response.json();
  assert.equal(data.vehicleId, 'car-1');
  assert.equal(data.status, 'pending');
});
