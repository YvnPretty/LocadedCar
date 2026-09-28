import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



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
    const unidadesVendidas = await prisma.vehiculo.count({ where: { estado: "vendido" } });

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
  } catch (error: unknown) {
    console.error("Error al obtener estadísticas POS:", error);
    return NextResponse.json(
      { error: "Error al consultar telemetría de ventas." },
      { status: 500 }
    );
  }
}
