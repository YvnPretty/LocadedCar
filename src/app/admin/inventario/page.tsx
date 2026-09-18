import { PrismaClient } from "@prisma/client";
import InventarioClient from "./InventarioClient";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminInventarioPage() {
  const cars = await prisma.vehiculo.findMany({
    include: {
      colores: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <InventarioClient initialCars={cars} />;
}
