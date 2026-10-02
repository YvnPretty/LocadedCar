import { prisma } from "@/lib/prisma";
import { calculatePayment, POSValidationError, validateRequest } from "@/lib/pos/payment";
import { registerSaleInTransaction } from "@/lib/pos/sale";

export type ContactlessStatus = "pending" | "approved" | "declined" | "expired";
const SESSION_TTL_MS = 10 * 60 * 1000;

export async function createContactlessSession(body: unknown) {
  const payload = validateRequest(body);
  if (payload.metodoPago !== "contactless") throw new POSValidationError("Seleccione Tap iPhone para crear la sesión.");
  const car = await prisma.vehiculo.findUnique({ where: { id: payload.vehiculoId }, include: { colores: true } });
  if (!car || car.estado !== "disponible") throw new POSValidationError("Esta unidad ya no está disponible.");
  const payment = calculatePayment(car.precio, payload.modalidad, payload.descuento, payload.montoTotal);
  if (payment.total !== payload.montoTotal) throw new POSValidationError("El precio cambió. Actualice el catálogo antes de cobrar.");
  if (payload.colorVarianteId && !car.colores.some(c => c.id === payload.colorVarianteId)) throw new POSValidationError("El color no pertenece al vehículo.");
  const session = await prisma.contactlessSession.create({ data: {
    amount: payment.total,
    vehicle: `${car.marca} ${car.modelo} (${car.anio})`,
    salePayload: JSON.stringify(payload),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  } });
  return publicSession(session);
}

// Never expose the captured customer data or server-side sale payload in session metadata.
function publicSession(session: { id: string; amount: number; vehicle: string; status: string; createdAt: Date; expiresAt: Date; transaccionId: string | null }) {
  return { id: session.id, amount: session.amount, vehicle: session.vehicle, status: session.status as ContactlessStatus,
    createdAt: session.createdAt.toISOString(), expiresAt: session.expiresAt.toISOString(), transaccionId: session.transaccionId };
}

export async function getContactlessSession(id: string) {
  await prisma.contactlessSession.updateMany({ where: { id, status: "pending", expiresAt: { lte: new Date() } }, data: { status: "expired" } });
  const session = await prisma.contactlessSession.findUnique({ where: { id } });
  if (!session) return null;
  const sale = session.transaccionId ? await prisma.transaccion.findUnique({ where: { id: session.transaccionId }, select: { recibo: true } }) : null;
  return { ...publicSession(session), receipt: sale?.recibo ? JSON.parse(sale.recibo) : null };
}

export async function updateContactlessSession(id: string, status: "approved" | "declined") {
  const current = await getContactlessSession(id);
  if (!current || current.status !== "pending") return current;
  await prisma.$transaction(async tx => {
    // Conditional claim and receipt creation share a transaction. Retrying cannot duplicate the sale.
    const claimed = await tx.contactlessSession.updateMany({
      where: { id, status: "pending", expiresAt: { gt: new Date() } }, data: { status },
    });
    if (!claimed.count || status === "declined") return;
    const session = await tx.contactlessSession.findUniqueOrThrow({ where: { id } });
    const receipt = await registerSaleInTransaction(tx, JSON.parse(session.salePayload));
    await tx.contactlessSession.update({ where: { id }, data: { transaccionId: receipt.transaccionId } });
  });
  return getContactlessSession(id);
}
