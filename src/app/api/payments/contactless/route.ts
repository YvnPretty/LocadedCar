import { networkInterfaces } from "node:os";
import { contactlessBaseUrl } from "@/lib/contactless-url";
import { NextResponse } from "next/server";
import { createContactlessSession } from "@/lib/contactless-sim";
import { POSValidationError } from "@/lib/pos/payment";

export const runtime = "nodejs";

function localInterfaces() {
  if (process.env.NODE_ENV === "production") return {};
  try { return networkInterfaces(); } catch { return {}; }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); } catch { throw new POSValidationError("JSON inválido."); }
    const session = await createContactlessSession(body);
    const baseUrl = contactlessBaseUrl(request.url, process.env.CONTACTLESS_PUBLIC_BASE_URL, localInterfaces());

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        paymentUrl: `${baseUrl}/tap/${session.id}`,
      },
    });
  } catch (error) {
    if (!(error instanceof POSValidationError)) console.error("Error al crear sesión contactless:", error);
    return NextResponse.json(
      { error: error instanceof POSValidationError ? error.message : "No fue posible crear la sesión de pago sin contacto." },
      { status: error instanceof POSValidationError ? 422 : 500 },
    );
  }
}
