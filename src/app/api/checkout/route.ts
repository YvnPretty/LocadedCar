import { NextResponse } from "next/server";
import { POSValidationError } from "@/lib/pos/payment";
import { registerSale } from "@/lib/pos/sale";

export async function POST(request: Request) {
  try {
    let body;
    try { body = await request.json(); } catch { throw new POSValidationError("JSON inválido."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new POSValidationError("Solicitud inválida.");
    const modality = body.modalidad === "Liquidación Total 100%" ? "contado" : body.modalidad === "Apartado de Chasis (10% de Anticipo)" ? "apartado_10" : body.modalidad;
    const method = ({ "Tarjeta de Crédito / Débito": "tarjeta", "Transferencia Interbancaria SPEI": "spei", "Financiamiento VIP": "financiamiento" } as Record<string, string>)[body.metodoPago] || body.metodoPago;
    const receipt = await registerSale({
      vehiculoId: body.vehiculoId, colorVarianteId: body.colorVarianteId, cliente: { nombre: body.nombre, correo: body.correo, telefono: body.telefono, direccion: body.direccion, ciudad: body.ciudad, estado: body.estado, rfc: body.rfc },
      modalidad: modality, metodoPago: method, montoTotal: body.montoTotal, montoRecibido: body.montoTotal,
      descuento: 0, plazoMeses: method === "financiamiento" ? body.plazoMeses ?? 24 : null,
      notasVenta: body.notasVenta, vendedorNombre: "Asesor Concierge LocadedCar VIP",
    });
    return NextResponse.json({ ...receipt, success: true, modalidad: body.modalidad, metodoPago: body.metodoPago });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = error instanceof POSValidationError ? 422 : message.includes("ya no está disponible") ? 409 : 500;
    return NextResponse.json({ error: status === 500 ? "No se pudo registrar el pago. Revise la conexión e intente de nuevo." : message }, { status });
  }
}
