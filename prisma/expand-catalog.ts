import type { PrismaClient } from '@prisma/client';
import { additionalVehicles } from './expanded-catalog';

/** Add demo inventory without resetting sales, prices, photos, or customer records. */
export async function expandCatalog(prisma: PrismaClient) {
  for (const vehicle of additionalVehicles) {
    const existing = await prisma.vehiculo.findFirst({
      where: { marca: vehicle.marca, modelo: vehicle.modelo, anio: vehicle.anio },
      select: { id: true },
    });
    if (existing) continue;
    // Stable IDs also make repeated seed executions safe.
    await prisma.vehiculo.upsert({
      where: { id: vehicle.id },
      update: {},
      create: vehicle,
    });
  }
}
