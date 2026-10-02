import { NextResponse } from "next/server";
import { createContactlessSession } from "@/lib/contactless-sim";

export const runtime = "nodejs";

function publicBaseUrl(request: Request) {
  const configured = process.env.CONTACTLESS_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.origin;
    } catch {
      // Fall back to the request origin when the demo URL is malformed.
    }
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { amount?: unknown; vehicle?: unknown };
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const vehicle = typeof body.vehicle === "string" ? body.vehicle : "";

    if (!Number.isFinite(amount) || amount <= 0 || !vehicle.trim()) {
      return NextResponse.json(
        { error: "Monto y vehículo son obligatorios para iniciar Tap to Pay demo." },
        { status: 422 },
      );
    }

    const session = createContactlessSession(amount, vehicle);
    const baseUrl = publicBaseUrl(request);

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        paymentUrl: `${baseUrl}/tap/${session.id}`,
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
