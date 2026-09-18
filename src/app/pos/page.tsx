import { PrismaClient } from "@prisma/client";
import POSClient from "./POSClient";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function POSPage() {
  // 1. Fetch initial inventory with color variants
  const cars = await prisma.vehiculo.findMany({
    include: {
      colores: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. Fetch frequent clients for fast selector
  const clients = await prisma.cliente.findMany({
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Get or create default POS Concierge seller
  let vendedor = await prisma.vendedor.findFirst({
    where: { usuario: "concierge_vip" },
  });

  if (!vendedor) {
    vendedor = await prisma.vendedor.findFirst();
  }

  if (!vendedor) {
    vendedor = await prisma.vendedor.create({
      data: {
        nombre: "Gabriel Domínguez (Asesor VIP)",
        usuario: "concierge_vip",
        contrasena: "pos_2026_secure",
      },
    });
  }

  return (
    <POSClient
      initialCars={cars}
      initialClients={clients}
      defaultVendedor={{
        id: vendedor.id,
        nombre: vendedor.nombre,
      }}
    />
  );
}
