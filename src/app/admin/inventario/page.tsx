import { getAdminSession } from '@/lib/admin/access';
import { PrismaClient } from "@prisma/client";
import InventarioClient from "./InventarioClient";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminInventarioPage() {
 if (!await getAdminSession()) return null;
  const cars = await prisma.vehiculo.findMany({
    include: {
      colores: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <InventarioClient initialCars={cars} />;
}
