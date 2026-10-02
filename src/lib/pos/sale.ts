import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveVehicleImage } from "@/lib/vehicle-media";
import { calculatePayment, money, POSValidationError, validateRequest } from "./payment";

export async function registerSaleInTransaction(tx: Prisma.TransactionClient, body: unknown) {
  const { vehiculoId, colorVarianteId, cliente, modalidad, metodoPago, montoTotal, montoRecibido, descuento, plazoMeses, notasVenta, vendedorNombre } = validateRequest(body);
  const clienteCorreo = cliente.correo;
  // 1. Validar vehículo y bloqueo de concurrencia
  const vehiculo = await tx.vehiculo.findUnique({
    where: { id: vehiculoId },
    include: { colores: true }
  });

  if (!vehiculo) {
    throw new POSValidationError("El vehículo no existe en el catálogo.");
  }

  const payment = calculatePayment(vehiculo.precio, modalidad, descuento, montoTotal);
  if (money(montoTotal) !== payment.total) throw new POSValidationError("El precio cambió. Actualice el catálogo antes de cobrar.");
  if (colorVarianteId && !vehiculo.colores.some(c => c.id === colorVarianteId)) throw new POSValidationError("El color no pertenece al vehículo.");
  if (metodoPago === "efectivo" && montoRecibido < payment.total) throw new POSValidationError("El efectivo recibido es insuficiente.");
  const reservado = await tx.vehiculo.updateMany({
    where: { id: vehiculo.id, estado: "disponible" },
    data: { estado: payment.state }
  });

  if (reservado.count !== 1) {
    throw new Error("Esta unidad ya no está disponible; otro proceso la reservó primero.");
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
      telefono: cliente.telefono || undefined,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      estado: cliente.estado,
      rfc: cliente.rfc
    },
    create: {
      nombre: cliente.nombre,
      correo: clienteCorreo,
      telefono: cliente.telefono || undefined,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      estado: cliente.estado,
      rfc: cliente.rfc
    }
  });

  // 4. Determinar monto a registrar y estado de la unidad
  const precioFinal = payment.total;
  const nuevoEstado = payment.state;

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

  // Buscar variante de color si fue seleccionada
  let colorSeleccionado = null;
  if (colorVarianteId) {
    colorSeleccionado = vehiculo.colores.find((c) => c.id === colorVarianteId) || null;
  }

  const folio = `LCD-POS-${transaccion.id}`;

  const receipt = {
    transaccionId: transaccion.id,
    folio,
    fecha: transaccion.fecha,
    modalidad,
    metodoPago,
    montoTotal: precioFinal,
    montoRecibido: metodoPago === "efectivo" ? money(montoRecibido) : precioFinal,
    cambio: metodoPago === "efectivo" ? money(montoRecibido - precioFinal) : 0,
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
      imagenUrl: resolveVehicleImage(vehiculo, colorSeleccionado?.imagenUrl),
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
  await tx.transaccion.update({ where: { id: transaccion.id }, data: { recibo: JSON.stringify(receipt), metodoPago, modalidad } });
  return receipt;
}

export async function registerSale(body: unknown) {
  const request = validateRequest(body);
  if (request.metodoPago === "contactless") throw new POSValidationError("Apruebe el pago desde su enlace Tap antes de registrar la venta.");
  return prisma.$transaction(tx => registerSaleInTransaction(tx, body));
}
