import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { NetworkInterfaceInfo } from 'node:os';
import { contactlessBaseUrl } from './contactless-url';
const wifi = { address: '192.168.1.55', family: 'IPv4', internal: false } as NetworkInterfaceInfo;
test('iPhone link uses LAN instead of localhost and preserves the server port', () => {
  assert.equal(contactlessBaseUrl('http://localhost:3001', undefined, { wlan0: [wifi] }), 'http://192.168.1.55:3001');
  assert.equal(contactlessBaseUrl('http://192.168.1.77:3000', undefined, { wlan0: [wifi] }), 'http://192.168.1.77:3000');
  assert.equal(contactlessBaseUrl('http://localhost:3000', 'https://cars.example/ignored', {}), 'https://cars.example');
  assert.equal(contactlessBaseUrl('http://localhost:3000', 'not a url', { wlan0: [wifi] }), 'http://192.168.1.55:3000');
  assert.equal(contactlessBaseUrl('http://localhost:3000', undefined, { docker0: [wifi] }), 'http://localhost:3000');
});
