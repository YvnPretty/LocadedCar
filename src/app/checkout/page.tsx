import { PrismaClient } from "@prisma/client";
import CheckoutClient from "./CheckoutClient";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculoId?: string }>;
}) {
  const { vehiculoId } = await searchParams;

  const cars = await prisma.vehiculo.findMany({
    include: { colores: true },
    orderBy: { createdAt: "desc" }
  });

  const selectedCar = 
    cars.find(c => c.id === vehiculoId) || 
    cars.find(c => c.estado === "disponible") || 
    cars[0];

  return <CheckoutClient cars={cars} initialCar={selectedCar} />;
}
