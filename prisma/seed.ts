import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar base de datos (opcional para no duplicar en múltiples corridas)
  await prisma.vehiculo.deleteMany({})

  const vehiculos = [
    {
      marca: 'Porsche',
      modelo: '911 GT3 RS',
      anio: 2023,
      precio: 5000000, // 5 millones MXN
      tipo: 'deportivo',
      estado: 'disponible',
      imagenUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2000&auto=format&fit=crop',
      detalles: '520 hp, 0-100 km/h en 3.2s. Aerodinámica activa avanzada.'
    },
    {
      marca: 'Audi',
      modelo: 'R8 V10 Performance',
      anio: 2022,
      precio: 3600000, // 3.6 millones MXN
      tipo: 'deportivo',
      estado: 'disponible',
      imagenUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop',
      detalles: 'V10 5.2L, tracción Quattro. Un ícono de la elegancia deportiva.'
    },
    {
      marca: 'Mercedes-Benz',
      modelo: 'AMG GT 63',
      anio: 2023,
      precio: 3300000, // 3.3 millones MXN
      tipo: 'semideportivo',
      estado: 'disponible',
      imagenUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2115&auto=format&fit=crop',
      detalles: 'Lujo, confort y un motor V8 Biturbo. Perfecto para el día a día.'
    },
    {
      marca: 'Ferrari',
      modelo: 'F8 Tributo',
      anio: 2021,
      precio: 6400000, // 6.4 millones MXN
      tipo: 'deportivo',
      estado: 'vendido',
      imagenUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070&auto=format&fit=crop',
      detalles: '710 hp, motor V8 galardonado. Pura pasión italiana.'
    }
  ]

  for (const auto of vehiculos) {
    await prisma.vehiculo.create({ data: auto })
  }

  console.log('Seeded database with sample cars!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
