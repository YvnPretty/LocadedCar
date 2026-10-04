import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { palettes } from "@/lib/vehicle-colors";
import { resolveVehicleImage } from "@/lib/vehicle-media";

// GET: List all vehicles
export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { colores: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, vehiculos });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo procesar la unidad." }, { status: 500 });
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

    if (typeof marca !== "string" || !marca.trim() || typeof modelo !== "string" || !modelo.trim() ||
        typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0 ||
        !Number.isInteger(anio) || anio < 1886 || anio > new Date().getFullYear() + 2 ||
        !["deportivo", "semideportivo"].includes(tipo) ||
        !["disponible", "apartado", "vendido"].includes(estado)) {
      return NextResponse.json({ error: "Revisa marca, modelo, año, precio y estado de la unidad." }, { status: 422 });
    }
    const photo = resolveVehicleImage({ marca, modelo, imagenUrl });
    const palette = palettes.find(item => item.marca === marca && item.modelo === modelo);
    const colors = photo ? palette?.colors.map(([nombre, hex]) => ({ nombre, hex, imagenUrl: photo })) ?? [] : [];
    if (marca === "Audi" && modelo === "R8 V10 Exclusive") {
      for (const [nombre, hex, file] of [["Rojo Carmín", "#d91e18", "red"], ["Azul Eléctrico", "#1e90ff", "blue"], ["Negro Obsidiana", "#111111", "black"], ["Plata Metálico", "#d4d4d4", "silver"]]) {
        colors.push({ nombre, hex, imagenUrl: `/renders/audi_r8_${file}.jpg` });
      }
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
          imagenUrl: photo,
          colores: { create: colors },
          detalles: detalles || "Unidad de Alto Rendimiento."
        },
        include: { colores: true }
      });
      return NextResponse.json({ success: true, vehiculo: nuevo });
    }

    return NextResponse.json({ error: "Datos incompletos para procesar la acción." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo procesar la unidad." }, { status: 500 });
  }
}
