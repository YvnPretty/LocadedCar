import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transacciones = await prisma.transaccion.findMany({
      include: {
        vehiculo: true,
        cliente: true,
        vendedor: true
      },
      orderBy: { fecha: "desc" }
    });

    const totalRecaudado = transacciones.reduce((acc, curr) => acc + curr.montoTotal, 0);
    const unidadesVendidas = transacciones.length;

    const vehiculosDisponibles = await prisma.vehiculo.count({
      where: { estado: "disponible" }
    });

    const vehiculosApartados = await prisma.vehiculo.count({
      where: { estado: "apartado" }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRecaudado,
        unidadesVendidas,
        vehiculosDisponibles,
        vehiculosApartados,
        totalTransacciones: transacciones.length
      },
      recientes: transacciones.slice(0, 10)
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas POS:", error);
    return NextResponse.json(
      { error: "Error al consultar telemetría de ventas." },
      { status: 500 }
    );
  }
}
