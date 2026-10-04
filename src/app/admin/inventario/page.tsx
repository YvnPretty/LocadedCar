import { prisma } from "@/lib/prisma";
import InventarioClient from "./InventarioClient";

export const dynamic = "force-dynamic";


export default async function AdminInventarioPage() {
  const cars = await prisma.vehiculo.findMany({
    include: {
      colores: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <InventarioClient initialCars={cars} />;
}
