import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vehiculoId,
      colorVarianteId,
      cliente,
      modalidad = "contado",
      metodoPago = "tarjeta",
      montoTotal,
      montoRecibido,
      cambio,
      descuento = 0,
      plazoMeses,
      notasVenta,
      vendedorNombre = "Asesor Concierge POS"
    } = body;

    if (!vehiculoId) {
      return NextResponse.json(
        { error: "Debe seleccionar un vehículo para procesar la transacción." },
        { status: 400 }
      );
    }

    if (!cliente || !cliente.nombre) {
      return NextResponse.json(
        { error: "Los datos del comprador (nombre) son obligatorios." },
        { status: 400 }
      );
    }

    const clienteCorreo = cliente.correo?.trim() 
      ? cliente.correo.trim() 
      : `vip.${Date.now()}@locadedcar-pos.com`;

    // Ejecución Atómica con Prisma $transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar vehículo y bloqueo de concurrencia
      const vehiculo = await tx.vehiculo.findUnique({
        where: { id: vehiculoId },
        include: { colores: true }
      });

      if (!vehiculo) {
        throw new Error("El vehículo no existe en el catálogo.");
      }

      if (vehiculo.estado === "vendido") {
        throw new Error("Esta unidad ya ha sido vendida previamente.");
      }

      // 2. Obtener o crear Vendedor en turno
      let vendedor = await tx.vendedor.findFirst({
        where: { nombre: vendedorNombre }
      });

      if (!vendedor) {
        vendedor = await tx.vendedor.findFirst();
      }

      if (!vendedor) {
        vendedor = await tx.vendedor.create({
          data: {
            nombre: vendedorNombre,
            usuario: "pos_terminal_01",
            contrasena: "pos_secure_hash_2026"
          }
        });
      }

      // 3. Upsert de Cliente
      const dbCliente = await tx.cliente.upsert({
        where: { correo: clienteCorreo },
        update: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || undefined
        },
        create: {
          nombre: cliente.nombre,
          correo: clienteCorreo,
          telefono: cliente.telefono || undefined
        }
      });

      // 4. Determinar monto a registrar y estado de la unidad
      const precioFinal = Number(montoTotal) || vehiculo.precio;
      const nuevoEstado = modalidad === "apartado_10" ? "apartado" : "vendido";

      // 5. Crear Transacción oficial
      const transaccion = await tx.transaccion.create({
        data: {
          montoTotal: precioFinal,
          vehiculoId: vehiculo.id,
          clienteId: dbCliente.id,
          vendedorId: vendedor.id
        },
        include: {
          vehiculo: true,
          cliente: true,
          vendedor: true
        }
      });

      // 6. Actualizar estado del vehículo
      await tx.vehiculo.update({
        where: { id: vehiculo.id },
        data: { estado: nuevoEstado }
      });

      // 7. Buscar variante de color si fue seleccionada
      let colorSeleccionado = null;
      if (colorVarianteId) {
        colorSeleccionado = vehiculo.colores.find((c) => c.id === colorVarianteId) || null;
      }

      const folio = `LCD-POS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      return {
        transaccionId: transaccion.id,
        folio,
        fecha: transaccion.fecha,
        modalidad,
        metodoPago,
        montoTotal: precioFinal,
        montoRecibido: Number(montoRecibido) || precioFinal,
        cambio: Number(cambio) || 0,
        descuento: Number(descuento) || 0,
        plazoMeses: plazoMeses || null,
        notasVenta: notasVenta || null,
        estadoUnidad: nuevoEstado,
        vehiculo: {
          id: vehiculo.id,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          precioOriginal: vehiculo.precio,
          tipo: vehiculo.tipo,
          imagenUrl: colorSeleccionado?.imagenUrl || vehiculo.imagenUrl,
          color: colorSeleccionado ? { nombre: colorSeleccionado.nombre, hex: colorSeleccionado.hex } : null,
          vinVirtual: `VIN-LOCADED-${vehiculo.anio}-${vehiculo.id.slice(0, 8).toUpperCase()}`
        },
        cliente: {
          id: dbCliente.id,
          nombre: dbCliente.nombre,
          correo: dbCliente.correo,
          telefono: dbCliente.telefono || cliente.telefono || "N/A",
          rfc: cliente.rfc || "XAXX010101000",
          direccion: cliente.direccion || "Mostrador Concesionaria VIP"
        },
        vendedor: {
          id: vendedor.id,
          nombre: vendedor.nombre
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Error al procesar venta POS:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al procesar la venta en POS." },
      { status: 500 }
    );
  }
}
