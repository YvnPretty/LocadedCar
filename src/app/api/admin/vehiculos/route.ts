import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all vehicles
export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { colores: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, vehiculos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create or Update vehicle status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, estado, marca, modelo, anio, precio, tipo, imagenUrl, detalles } = body;

    // Action 1: Toggle/Update Status
    if (action === "update_status" && id && estado) {
      const updated = await prisma.vehiculo.update({
        where: { id },
        data: { estado }
      });
      return NextResponse.json({ success: true, vehiculo: updated });
    }

    // Action 2: Create New Vehicle
    if (marca && modelo && precio) {
      const nuevo = await prisma.vehiculo.create({
        data: {
          marca,
          modelo,
          anio: Number(anio) || new Date().getFullYear(),
          precio: Number(precio),
          tipo: tipo || "deportivo",
          estado: estado || "disponible",
          imagenUrl: imagenUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2000&auto=format&fit=crop",
          detalles: detalles || "Unidad de Alto Rendimiento."
        }
      });
      return NextResponse.json({ success: true, vehiculo: nuevo });
    }

    return NextResponse.json({ error: "Datos incompletos para procesar la acción." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
