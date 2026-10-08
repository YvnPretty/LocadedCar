import { prisma } from "@/lib/prisma";
import POSClient from "./POSClient";

export const dynamic = "force-dynamic";



export default async function POSPage() {
  const [cars, clients, defaultSeller] = await Promise.all([
    prisma.vehiculo.findMany({ include: { colores: true }, orderBy: { createdAt: "desc" } }),
    prisma.cliente.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
    prisma.vendedor.findFirst({ where: { usuario: "concierge_vip" } }),
  ]);
  let vendedor = defaultSeller;

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
