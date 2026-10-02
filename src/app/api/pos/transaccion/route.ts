import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSale } from "@/lib/pos/sale";
import { POSValidationError } from "@/lib/pos/payment";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); } catch { throw new POSValidationError("JSON inválido."); }
    const result = await registerSale(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = error instanceof POSValidationError ? 422 : message.includes("ya no está disponible") ? 409 : 500;
    return NextResponse.json({ error: status === 500 ? "No se pudo registrar la venta. Revise la conexión e intente de nuevo." : message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().slice(0, 250);
    const id = q.replace(/^LCD-(?:POS|WEB)-/i, "");
    const page = Math.max(1, Math.min(100000, Math.floor(Number(url.searchParams.get("page")) || 1)));
    const where = q ? { OR: [
      { id: { contains: id } }, { cliente: { nombre: { contains: q } } },
      { cliente: { correo: { contains: q } } }, { cliente: { telefono: { contains: q } } },
      { vehiculo: { marca: { contains: q } } }, { vehiculo: { modelo: { contains: q } } },
    ] } : {};
    const [rows, total] = await prisma.$transaction([
      prisma.transaccion.findMany({ where, select: { id: true, fecha: true, montoTotal: true, metodoPago: true, modalidad: true, recibo: true,
        cliente: { select: { nombre: true, correo: true } }, vehiculo: { select: { marca: true, modelo: true, anio: true } } }, orderBy: [{ fecha: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20 }),
      prisma.transaccion.count({ where }),
    ]);
    return NextResponse.json({ success: true, total, page, pages: Math.max(1, Math.ceil(total / 20)), data: rows.map(({ recibo, ...row }) => ({
      ...row, folio: recibo ? JSON.parse(recibo).folio : `LCD-POS-${row.id}`, receipt: recibo ? JSON.parse(recibo) : null,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar el historial de pagos. Intente nuevamente." }, { status: 500 });
  }
}
