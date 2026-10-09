import type { PrismaClient } from '@prisma/client';
import { resolveVehicleImage } from '../src/lib/vehicle-media';

import { vehiclePalettes as palettes } from '../src/lib/vehicle-colors';

/** Add missing variants on both existing and new databases; preserve custom variants. */
export async function ensureVehicleColors(prisma: PrismaClient) {
  for (const palette of palettes) {
    const cars = await prisma.vehiculo.findMany({
      where: { marca: palette.marca, modelo: palette.modelo },
      include: { colores: true },
    });
    for (const car of cars) {
      const imagenUrl = resolveVehicleImage(car);
      if (!imagenUrl) continue;
      for (const [index, [nombre, hex]] of palette.colors.entries()) {
        if (car.colores.some(color => color.nombre.toLowerCase() === nombre.toLowerCase())) continue;
        await prisma.colorVariante.upsert({
          where: { id: `catalog-color:${car.id}:${index}` },
          update: {},
          create: { id: `catalog-color:${car.id}:${index}`, vehiculoId: car.id, nombre, hex, imagenUrl },
        });
      }
    }
  }
}
