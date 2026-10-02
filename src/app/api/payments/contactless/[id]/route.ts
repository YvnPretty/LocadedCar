import { NextResponse } from "next/server";
import {
  getContactlessSession,
  updateContactlessSession,
} from "@/lib/contactless-sim";
import { POSValidationError } from "@/lib/pos/payment";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  let session;
  try { session = await getContactlessSession(id); }
  catch { return NextResponse.json({ error: "No se pudo consultar el pago. Intente de nuevo." }, { status: 500 }); }

  if (!session) {
    return NextResponse.json({ error: "Sesión de pago no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: session }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let action: unknown;
  try {
    const body = (await request.json()) as { action?: unknown };
    action = body.action;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (action !== "approve" && action !== "decline") {
    return NextResponse.json(
      { error: "Acción inválida. Use approve o decline." },
      { status: 422 },
    );
  }

  let session;
  try {
    session = await updateContactlessSession(id, action === "approve" ? "approved" : "declined");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = error instanceof POSValidationError ? 422 : message.includes("ya no está disponible") ? 409 : 500;
    return NextResponse.json({ error: status === 500 ? "No se pudo registrar el pago. Puede reintentar sin duplicar la venta." : message }, { status });
  }

  if (!session) {
    return NextResponse.json({ error: "Sesión de pago no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: session });
}
