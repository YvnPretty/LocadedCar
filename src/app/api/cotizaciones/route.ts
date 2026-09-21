import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const correo = String(body.correo || "").trim().toLowerCase();
    const telefono = String(body.telefono || "").trim();
    const mensaje = String(body.mensaje || "").trim();

    if (!nombre || !correo || !mensaje) {
      return NextResponse.json(
        { error: "Nombre, correo y mensaje son obligatorios." },
        { status: 400 }
      );
    }

    const cotizacion = await prisma.cotizacion.create({
      data: { nombre, correo, telefono: telefono || null, mensaje }
    });

    return NextResponse.json({ success: true, id: cotizacion.id }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar cotización:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}