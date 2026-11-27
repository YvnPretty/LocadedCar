import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
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
    const escape = (value: unknown) => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] || ch));
    const price = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(receipt.montoTotal);
    const steps = [
      ['01 · Selección', 'Toyota GR Supra 2020 · Azul Racing'],
      ['02 · Titular', 'Prueba automatizada · datos ficticios'],
      ['03 · Pago simulado', 'Liquidación total · Tarjeta de prueba · ' + price],
      ['04 · Confirmación', 'HTTP ' + response.status + ' · transacción creada'],
      ['05 · Inventario', 'Vendido en la base aislada · segundo intento HTTP ' + duplicate.status],
    ];
    await writeFile('public/prueba-compra.html', `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LocadedCar · Prueba de compra</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f3f4ef;color:#1b3028;font:16px system-ui,sans-serif}main{max-width:800px;margin:0 auto;padding:32px 20px}h1{font-size:clamp(28px,6vw,44px);font-weight:500;letter-spacing:-1.5px}h2{font-size:20px}header{display:flex;justify-content:space-between;align-items:center;gap:12px}small{color:#52645b}img{display:block;width:100%;border-radius:20px;max-height:350px;object-fit:contain;background:white}.panel{border:1px solid #d7ded5;border-radius:20px;padding:20px;background:white;margin:20px 0}ol{list-style:none;padding:0;margin:0}li{padding:14px 0;border-bottom:1px solid #e2e7e0}li:last-child{border:0}li strong{display:block;margin-bottom:5px}a{display:block;text-align:center;background:#203f30;color:white;padding:15px;border-radius:12px;text-decoration:none;margin-top:12px}code{overflow-wrap:anywhere}p{line-height:1.5}.tag{background:#e3efd8;padding:7px 10px;border-radius:8px;font-size:12px}</style></head><body><main>
    <header><b>LOCADEDCAR</b><span class="tag">PRUEBA SUPERADA</span></header><h1>Simulación de compra verificada</h1><p>Resultado del endpoint y la base de datos de pruebas ejecutados durante la compilación. No se realizó un pago real ni se modificó el inventario publicado.</p>
    <img src="/vehicles/catalog-1.jpg" alt="Toyota GR Supra, fotografía original"><section class="panel"><h2>Proceso ejecutado</h2><ol>${steps.map(([title,detail])=>`<li><strong>${escape(title)}</strong><small>${escape(detail)}</small></li>`).join('')}</ol></section>
    <section class="panel"><h2>Comprobante generado</h2><p>Folio: <code>${escape(receipt.transaccionId)}</code></p><p>Fecha: ${escape(receipt.fecha)}</p><p>Importe simulado: <strong>${escape(price)}</strong></p><p>Color: Azul Racing · registro verificado</p><small>La unidad temporal y sus datos se eliminaron de la base de pruebas después de la verificación.</small></section>
    <a href="/catalogo/catalog-expansion-01">Abrir configurador del Toyota GR Supra</a><a href="/checkout?vehiculoId=catalog-expansion-01">Iniciar una compra de demostración en la tienda</a></main></body></html>`);
    console.log('CHECKOUT DEMO RESULT:', JSON.stringify({ folio: receipt.transaccionId, color: receipt.vehiculo.color.nombre, monto: receipt.montoTotal, status: response.status, duplicate: duplicate.status }));
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
