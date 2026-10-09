import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { getVehicleColors, paintTransfer, vehiclePalettes } from './vehicle-colors';
import { vehiclePaintMasks } from './vehicle-paint';

test('all eight reference models have usable color previews without seeding the database', () => {
  assert.equal(vehiclePalettes.length, 8);
  for (const car of vehiclePalettes) {
    const colors = getVehicleColors(car);
    assert.equal(colors.length, 4);
    for (const color of colors) {
      assert.ok(existsSync(`public${color.imagenUrl}`));
      assert.ok(vehiclePaintMasks[color.imagenUrl]);
      assert.ok(paintTransfer(color.hex, 'gloss'));
    }
  }
});
test('preserves real variant photos and never assigns reference masks to custom uploads', () => {
  const car = { marca: 'Porsche', modelo: '911 GT3 RS', imagenUrl: '/uploads/unit.jpg' };
  assert.deepEqual(getVehicleColors(car), []);
  const variants = [{ nombre: 'Custom', hex: '#123456', imagenUrl: '/uploads/custom.jpg' }];
  assert.deepEqual(getVehicleColors(car, variants), variants);
  assert.equal(vehiclePaintMasks[variants[0].imagenUrl], undefined);
  assert.deepEqual(getVehicleColors({marca:'Unknown', modelo:'New'}), []);
});
test('paint responds to both hue and finish with bounded channel values', () => {
  assert.notDeepEqual(paintTransfer('#ff0000', 'gloss'), paintTransfer('#0000ff', 'gloss'));
  assert.notDeepEqual(paintTransfer('#2463a0', 'gloss'), paintTransfer('#2463a0', 'matte'));
  assert.notDeepEqual(paintTransfer('#2463a0', 'satin'), paintTransfer('#2463a0', 'matte'));
  assert.equal(paintTransfer('invalid', 'gloss'), null);
  for (const hex of ['#ffffff','#000000','#f1c40f']) {
    for (const channel of paintTransfer(hex, 'gloss')!) {
      assert.ok(channel.split(' ').map(Number).every(n => n >= 0 && n <= 1));
    }
  }
});
