import { resolveVehicleImage } from "@/lib/vehicle-media";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      vehiculoId,
      colorVarianteId,
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

    const result = await prisma.$transaction(async (tx) => {
      const vehiculo = await tx.vehiculo.findUnique({
        where: { id: vehiculoId },
        include: { colores: true }
      });

      if (!vehiculo) {
        throw new Error("El vehículo seleccionado no existe en el catálogo.");
      }

      const color = colorVarianteId ? vehiculo.colores.find(item => item.id === colorVarianteId) : null;
      if (colorVarianteId && !color) throw new Error("El color no pertenece al vehículo seleccionado.");

      const reservado = await tx.vehiculo.updateMany({
        where: { id: vehiculo.id, estado: "disponible" },
        data: { estado: "vendido" }
      });

      if (reservado.count !== 1) {
        throw new Error("Esta unidad ya no está disponible; otro proceso la reservó primero.");
      }

      let vendedor = await tx.vendedor.findFirst();
      if (!vendedor) {
        vendedor = await tx.vendedor.create({
          data: {
            nombre: "Asesor Concierge LocadedCar VIP",
            usuario: "concierge_vip",
            contrasena: "secret_vip_2026"
          }
        });
      }

      const cliente = await tx.cliente.upsert({
        where: { correo },
        update: { nombre, telefono: telefono || undefined, direccion, ciudad, estado, rfc },
        create: { nombre, correo, telefono: telefono || undefined, direccion, ciudad, estado, rfc }
      });

      const transaccion = await tx.transaccion.create({
        data: {
          montoTotal: Number(montoTotal) || vehiculo.precio,
          vehiculoId: vehiculo.id,
          clienteId: cliente.id,
          vendedorId: vendedor.id
        },
        include: { vehiculo: true, cliente: true, vendedor: true }
      });

      return { vehiculo, cliente, vendedor, transaccion, color };
    });

    const { vehiculo, cliente, vendedor, transaccion, color } = result;

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
        imagenUrl: resolveVehicleImage(vehiculo, color?.imagenUrl),
        color: color ? { nombre: color.nombre, hex: color.hex } : null
      },
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        rfc: cliente.rfc
      },
      vendedor: {
        nombre: vendedor.nombre
      }
    });
  } catch (error: unknown) {
    console.error("Error al procesar pago:", error);
    const message = error instanceof Error ? error.message : "Error interno al procesar el pago.";
    const status = message.includes("ya no está disponible") ? 409 : message.includes("El color no pertenece") ? 422 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
