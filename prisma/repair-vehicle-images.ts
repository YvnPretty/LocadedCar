import type { PrismaClient } from '@prisma/client';
import { vehicleMedia } from '../src/lib/vehicle-media';
/** Idempotent repair: only demo URLs, never user-supplied photos or inventory fields. */
export async function repairVehicleImages(prisma: PrismaClient) {
  for (const photo of vehicleMedia) {
    await prisma.vehiculo.updateMany({
      where: { marca: photo.brand, modelo: photo.model, OR: [{ imagenUrl: { contains: photo.legacy } }, { imagenUrl: null }, { imagenUrl: '' }] },
      data: { imagenUrl: `/vehicles/${photo.file}` },
    });
  }
}
