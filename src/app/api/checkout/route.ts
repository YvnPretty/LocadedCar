import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      vehiculoId, 
      nombre, 
      correo, 
      telefono, 
      montoTotal, 
      metodoPago, 
      modalidad,
      direccion,
      ciudad,
      estado,
      rfc 
    } = body;

    if (!vehiculoId || !nombre || !correo) {
      return NextResponse.json(
        { error: "Los campos de vehículo, nombre y correo son obligatorios." },
        { status: 400 }
      );
    }

    // 1. Verificar existencia del vehículo
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      include: { colores: true }
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: "El vehículo seleccionado no existe en el catálogo." },
        { status: 404 }
      );
    }

    // 2. Obtener o crear Vendedor Concierge VIP por defecto
    let vendedor = await prisma.vendedor.findFirst();
    if (!vendedor) {
      vendedor = await prisma.vendedor.create({
        data: {
          nombre: "Asesor Concierge LocadedCar VIP",
          usuario: "concierge_vip",
          contrasena: "secret_vip_2026"
        }
      });
    }

    // 3. Crear o actualizar datos del Cliente
    const cliente = await prisma.cliente.upsert({
      where: { correo },
      update: {
        nombre,
        telefono: telefono || undefined
      },
      create: {
        nombre,
        correo,
        telefono: telefono || undefined
      }
    });

    // 4. Registrar la Transacción oficial en base de datos
    const transaccion = await prisma.transaccion.create({
      data: {
        montoTotal: Number(montoTotal) || vehiculo.precio,
        vehiculoId: vehiculo.id,
        clienteId: cliente.id,
        vendedorId: vendedor.id
      },
      include: {
        vehiculo: true,
        cliente: true,
        vendedor: true
      }
    });

    // 5. Actualizar estado del vehículo a "vendido"
    await prisma.vehiculo.update({
      where: { id: vehiculo.id },
      data: { estado: "vendido" }
    });

    return NextResponse.json({
      success: true,
      transaccionId: transaccion.id,
      fecha: transaccion.fecha,
      montoTotal: transaccion.montoTotal,
      modalidad: modalidad || "Pago Total Contado",
      metodoPago: metodoPago || "Tarjeta de Crédito",
      vehiculo: {
        id: vehiculo.id,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        precio: vehiculo.precio,
        imagenUrl: vehiculo.imagenUrl
      },
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        direccion,
        ciudad,
        estado,
        rfc
      },
      vendedor: {
        nombre: vendedor.nombre
      }
    });
  } catch (error: any) {
    console.error("Error al procesar pago:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al procesar el pago." },
      { status: 500 }
    );
  }
}
