import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolveVehicleImage, vehicleMedia, vehicleName } from './vehicle-media';
test('all legacy photos map to local files for the exact model', () => {
  for (const item of vehicleMedia) {
    const car = { marca: item.brand, modelo: item.model, imagenUrl: `https://images.unsplash.com/${item.legacy}` };
    assert.equal(resolveVehicleImage(car), `/vehicles/${item.file}`);
    assert.ok(existsSync(`public/vehicles/${item.file}`));
    assert.equal(vehicleName(car), item.identity);
  }
});
test('missing photos do not become a different car and user uploads survive', () => {
  assert.equal(resolveVehicleImage({marca:'Unknown',modelo:'New',imagenUrl:null}),null);
  assert.equal(resolveVehicleImage({marca:'Chevrolet',modelo:'Corvette Z06',imagenUrl:'/uploads/actual-unit.jpg'}),'/uploads/actual-unit.jpg');
  assert.equal(resolveVehicleImage({marca:'Chevrolet',modelo:'Corvette Z06',imagenUrl:'/renders/audi_r8_red.jpg'}),'/vehicles/chevrolet-corvette-z06-c8.jpg');
});
