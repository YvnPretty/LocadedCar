import { resolveVehicleImage } from "@/lib/vehicle-media";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVehicleColors } from "@/lib/vehicle-colors";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      vehiculoId,
      colorVarianteId,
      colorNombre,
      nombre, 
      correo, 
      telefono, 
      metodoPago, 
      modalidad,
      direccion,
      ciudad,
      estado,
      rfc 
    } = body;

    if (typeof vehiculoId !== "string" || !vehiculoId || typeof nombre !== "string" || !nombre.trim() || typeof correo !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) || typeof telefono !== "string" || !telefono.trim()) {
      return NextResponse.json(
        { error: "Los campos de vehículo, nombre, correo válido y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    const modes = ["Liquidación Total 100%", "Apartado de Chasis (10% de Anticipo)"];
    const methods = ["Tarjeta de Crédito / Débito", "Transferencia Interbancaria SPEI", "Financiamiento VIP"];
    if (!modes.includes(modalidad) || !methods.includes(metodoPago)) return NextResponse.json({ error: "Modalidad o método de pago no válido." }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const vehiculo = await tx.vehiculo.findUnique({
        where: { id: vehiculoId },
        include: { colores: true }
      });

      if (!vehiculo) {
        throw new Error("El vehículo seleccionado no existe en el catálogo.");
      }

      const color = colorVarianteId ? vehiculo.colores.find(item => item.id === colorVarianteId) : colorNombre ? getVehicleColors(vehiculo, vehiculo.colores).find(item => item.nombre === colorNombre) : null;
      if ((colorVarianteId || colorNombre) && (!color || (colorNombre && color.nombre !== colorNombre))) throw new Error("El color no pertenece al vehículo seleccionado.");
      const monto = modalidad === modes[1] ? Math.round(vehiculo.precio * 0.10) : vehiculo.precio;

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
            contrasena: randomUUID()
          }
        });
      }

      const cliente = await tx.cliente.upsert({
        where: { correo: correo.trim().toLowerCase() },
        update: { nombre: nombre.trim(), telefono: telefono.trim(), direccion, ciudad, estado, rfc },
        create: { nombre: nombre.trim(), correo: correo.trim().toLowerCase(), telefono: telefono.trim(), direccion, ciudad, estado, rfc }
      });

      const transaccion = await tx.transaccion.create({
        data: {
          montoTotal: monto,
          colorNombre: color?.nombre,
          colorHex: color?.hex,
          modalidad,
          metodoPago,
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
    const status = message.includes("ya no está disponible") ? 409 : message.includes("El color no pertenece") ? 422 : message.includes("no existe en el catálogo") ? 404 : 500;
    return NextResponse.json(
      { error: status === 500 ? "No se pudo registrar la compra. Intenta de nuevo." : message },
      { status }
    );
  }
}
