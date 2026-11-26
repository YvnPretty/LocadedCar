import type { PrismaClient } from '@prisma/client';
import { getVehicleColors } from '../src/lib/vehicle-colors';

/** Seed missing demo variants for every catalog vehicle; never replace custom variants. */
export async function ensureVehicleColors(prisma: PrismaClient) {
  const cars = await prisma.vehiculo.findMany({ include: { colores: true } });
  for (const car of cars) {
    if (car.colores.length) continue;
    const colors = getVehicleColors(car);
    for (const [index, color] of colors.entries()) {
      await prisma.colorVariante.upsert({
        where: { id: `catalog-color:${car.id}:${index}` },
        update: {},
        create: { id: `catalog-color:${car.id}:${index}`, vehiculoId: car.id, ...color },
      });
    }
  }
}
