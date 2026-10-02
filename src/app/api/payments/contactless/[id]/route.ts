import { NextResponse } from "next/server";
import {
  getContactlessSession,
  updateContactlessSession,
} from "@/lib/contactless-sim";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = getContactlessSession(id);

  if (!session) {
    return NextResponse.json({ error: "Sesión de pago no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: session });
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

  const session = updateContactlessSession(
    id,
    action === "approve" ? "approved" : "declined",
  );

  if (!session) {
    return NextResponse.json({ error: "Sesión de pago no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: session });
}
