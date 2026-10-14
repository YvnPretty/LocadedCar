import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { expandCatalog } from '../prisma/expand-catalog.ts';
import { additionalVehicles } from '../prisma/expanded-catalog.ts';

test('catalog expansion preserves existing inventory and customers, and is repeatable', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'locaded-catalog-'));
  writeFileSync(join(directory, 'test.db'), '');
  const url = `file:${join(directory, 'test.db')}`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], {
      env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe',
    });
    const vehicle = additionalVehicles[0];
    await prisma.vehiculo.create({ data: { ...vehicle, id: 'existing-unit', estado: 'vendido', precio: 123, imagenUrl: '/uploads/custom.jpg' } });
    await prisma.cliente.create({ data: { nombre: 'Existing customer', correo: 'fixture@example.test' } });
    await expandCatalog(prisma);
    assert.equal(await prisma.vehiculo.count(), 40);
    await expandCatalog(prisma);
    assert.equal(await prisma.vehiculo.count(), 40);
    assert.equal(await prisma.cliente.count(), 1);
    const preserved = await prisma.vehiculo.findUniqueOrThrow({ where: { id: 'existing-unit' } });
    assert.equal(preserved.estado, 'vendido');
    assert.equal(preserved.precio, 123);
    assert.equal(preserved.imagenUrl, '/uploads/custom.jpg');
    for (const car of additionalVehicles) assert.ok(existsSync(`public${car.imagenUrl}`));
  } finally {
    await prisma.$disconnect();
    rmSync(directory, { recursive: true, force: true });
  }
});
