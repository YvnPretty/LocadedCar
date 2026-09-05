import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos antes de hacer seed
  await prisma.transaccion.deleteMany()
  await prisma.vehiculo.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.vendedor.deleteMany()

  console.log('Seeding database with a wide range of premium sports cars...')

  // Insertar autos
  const cars = await prisma.vehiculo.createMany({
    data: [
      {
        marca: 'Porsche',
        modelo: '911 GT3 RS',
        anio: 2023,
        precio: 5000000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2000&auto=format&fit=crop',
        detalles: '520 hp, 0-100 km/h en 3.2s. Aerodinámica activa avanzada.'
      },
      {
        marca: 'Audi',
        modelo: 'R8 V10 Performance',
        anio: 2022,
        precio: 3600000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop',
        detalles: 'Motor V10 atmosférico de 5.2 litros, 620 hp, tracción quattro.'
      },
      {
        marca: 'Mercedes-Benz',
        modelo: 'AMG GT 63',
        anio: 2023,
        precio: 3300000, 
        tipo: 'semideportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2115&auto=format&fit=crop',
        detalles: 'Coupé de 4 puertas, V8 biturbo con 639 hp. Lujo y rendimiento superior.'
      },
      {
        marca: 'Ferrari',
        modelo: 'F8 Tributo',
        anio: 2021,
        precio: 6400000, 
        tipo: 'deportivo',
        estado: 'vendido',
        imagenUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070&auto=format&fit=crop',
        detalles: 'El V8 más potente en la historia de Ferrari, 720 hp de puro diseño italiano.'
      },
      {
        marca: 'Lamborghini',
        modelo: 'Aventador SVJ',
        anio: 2022,
        precio: 12000000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd3d92?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor V12 de 6.5L, 770 hp. Aerodinámica activa ALA 2.0. Pura agresividad.'
      },
      {
        marca: 'Bugatti',
        modelo: 'Chiron',
        anio: 2021,
        precio: 60000000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor W16 quad-turbo de 8.0L, 1500 hp. El pináculo de la ingeniería automotriz hiperdeportiva.'
      },
      {
        marca: 'Pagani',
        modelo: 'Huayra Roadster',
        anio: 2020,
        precio: 55000000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1566274360936-ce22c71981cc?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor V12 biturbo de Mercedes-AMG, arte sobre ruedas en fibra de carbono y titanio.'
      },
      {
        marca: 'Ford',
        modelo: 'Mustang Shelby GT500',
        anio: 2023,
        precio: 2500000, 
        tipo: 'semideportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1584345604476-8cb5e3927500?q=80&w=2000&auto=format&fit=crop',
        detalles: 'V8 supercargado de 5.2L con 760 hp. El muscle car definitivo para pista y calle.'
      },
      {
        marca: 'Chevrolet',
        modelo: 'Corvette Z06',
        anio: 2024,
        precio: 3100000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor central V8 atmosférico plano de 5.5L con 670 hp. Rendimiento exótico americano.'
      },
      {
        marca: 'Audi',
        modelo: 'TT RS',
        anio: 2022,
        precio: 1800000, 
        tipo: 'semideportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor de 5 cilindros turbo, 400 hp. Diseño icónico y ágil con tracción quattro.'
      }
    ]
  })

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
