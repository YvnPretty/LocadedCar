import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/lib/prisma';
import { POST } from '../src/app/api/checkout/route';

async function main() {
  const nonce = randomUUID();
  const email = `checkout-test-${nonce}@example.invalid`;
  let id: string | undefined;
  try {
    const car = await prisma.vehiculo.create({ data: {
      marca: 'Toyota', modelo: 'GR Supra', anio: 2020, precio: 1250000,
      tipo: 'deportivo', imagenUrl: '/vehicles/catalog-1.jpg',
      colores: { create: { nombre: 'Azul Racing', hex: '#2463a0', imagenUrl: '/vehicles/catalog-1.jpg' } }
    }, include: { colores: true } });
    id = car.id;
    const data = { vehiculoId: id, colorVarianteId: car.colores[0].id, colorNombre: 'Azul Racing',
      nombre: 'Prueba automatizada', correo: email, telefono: '0000000000',
      modalidad: 'Liquidación Total 100%', metodoPago: 'Tarjeta de Crédito / Débito', montoTotal: 1 };
    const request = () => new Request('http://localhost/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const response = await POST(request());
    const receipt = await response.json();
    assert.equal(response.status, 200, JSON.stringify(receipt));
    assert.equal(receipt.success, true);
    assert.equal(receipt.vehiculo.color.nombre, 'Azul Racing');
    assert.equal(receipt.montoTotal, 1250000);
    const sale = await prisma.transaccion.findUniqueOrThrow({ where: { id: receipt.transaccionId } });
    assert.equal(sale.colorNombre, 'Azul Racing');
    assert.equal(sale.montoTotal, 1250000);
    assert.equal((await prisma.vehiculo.findUniqueOrThrow({ where: { id } })).estado, 'vendido');
    const duplicate = await POST(request());
    assert.equal(duplicate.status, 409);
    assert.equal(await prisma.transaccion.count({ where: { vehiculoId: id } }), 1);
    console.log('CHECKOUT E2E PASS: receipt, selected color, stored price, sold inventory, duplicate rejected.');
  } finally {
    if (id) {
      await prisma.transaccion.deleteMany({ where: { vehiculoId: id } });
      await prisma.vehiculo.deleteMany({ where: { id } });
    }
    await prisma.cliente.deleteMany({ where: { correo: email } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
