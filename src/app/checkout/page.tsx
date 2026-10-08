import { prisma } from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";


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

  const selectedCar = cars.find(c => c.id === vehiculoId);

  return <CheckoutClient key={vehiculoId || "resume"} cars={cars} initialCar={selectedCar} />;
}
