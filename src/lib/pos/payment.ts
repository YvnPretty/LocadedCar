export class POSValidationError extends Error {}
export const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculatePayment(price: number, mode: string, discount: number, custom: number) {
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(discount) || discount < 0 || discount >= price) {
    throw new POSValidationError('El descuento debe ser mayor o igual a cero y menor al precio.');
  }
  const balance = money(price - discount);
  if (!['contado', 'apartado_10', 'personalizado'].includes(mode)) throw new POSValidationError('Modalidad inválida.');
  const total = mode === 'contado' ? balance : mode === 'apartado_10' ? money(balance * 0.1) : money(custom);
  if (!Number.isFinite(total) || total <= 0 || total > balance) throw new POSValidationError('El anticipo debe ser mayor a cero y no exceder el saldo.');
  return { total, balance, state: total < balance ? 'apartado' : 'vendido' };
}

export function validateRequest(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new POSValidationError('Solicitud inválida.');
  const data = body as Record<string, unknown>;
  const text = (value: unknown, max = 250) => {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string' || value.length > max) throw new POSValidationError('Texto inválido o demasiado largo.');
    return value.trim();
  };
  const number = (value: unknown, fallback = 0) => {
    if (value === undefined) return fallback;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new POSValidationError('Importe inválido.');
    return value;
  };
  if (!data.cliente || typeof data.cliente !== 'object' || Array.isArray(data.cliente)) throw new POSValidationError('Comprador obligatorio.');
  const client = data.cliente as Record<string, unknown>;
  const cliente = { nombre: text(client.nombre), correo: text(client.correo).toLowerCase(), telefono: text(client.telefono, 30), rfc: text(client.rfc, 20), direccion: text(client.direccion) };
  if (!cliente.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) throw new POSValidationError('Ingrese nombre y correo válido del comprador.');
  const vehiculoId = text(data.vehiculoId);
  const modalidad = text(data.modalidad);
  const metodoPago = text(data.metodoPago);
  if (!vehiculoId) throw new POSValidationError('Seleccione un vehículo.');
  if (!['tarjeta', 'contactless', 'spei', 'efectivo', 'financiamiento'].includes(metodoPago)) throw new POSValidationError('Método de pago inválido.');
  const plazoMeses = number(data.plazoMeses ?? undefined);
  if (metodoPago === 'financiamiento' && ![12,24,36,48].includes(plazoMeses)) throw new POSValidationError('Plazo inválido.');
  return { vehiculoId, colorVarianteId: text(data.colorVarianteId), cliente, modalidad, metodoPago, montoTotal: number(data.montoTotal), montoRecibido: number(data.montoRecibido), descuento: number(data.descuento), plazoMeses, notasVenta: text(data.notasVenta, 2000), vendedorNombre: text(data.vendedorNombre) };
}
