import { NextResponse } from "next/server";
import { createContactlessSession } from "@/lib/contactless-sim";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: { amount?: unknown; vehicle?: unknown; vehicleId?: unknown };
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Solicitud inválida." }, { status: 422 });
      }
      body = parsed;
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    const amount = typeof body.amount === "number" ? body.amount : NaN;
    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId.trim() : "";
    const vehicle = typeof body.vehicle === "string" ? body.vehicle : "";

    if (!Number.isFinite(amount) || Math.round(amount * 100) <= 0 || !Number.isSafeInteger(Math.round(amount * 100)) || !vehicle.trim() || !vehicleId || vehicleId.length > 250) {
      return NextResponse.json(
        { error: "Monto y vehículo son obligatorios para iniciar Tap to Pay demo." },
        { status: 422 },
      );
    }

    const session = createContactlessSession(amount, vehicle, vehicleId);

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        paymentUrl: `/tap/${session.id}`,
      },
    });
  } catch (error) {
    console.error("Error al crear sesión contactless:", error);
    return NextResponse.json(
      { error: "No fue posible crear la sesión de pago sin contacto." },
      { status: 500 },
    );
  }
}
