import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.colorVariante.deleteMany()
  await prisma.transaccion.deleteMany()
  await prisma.vehiculo.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.vendedor.deleteMany()

  console.log('Seeding database with premium sports cars...')

  // Insertar autos normales
  await prisma.vehiculo.createMany({
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
        imagenUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2000&auto=format&fit=crop',
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
        detalles: 'Motor W16 quad-turbo de 8.0L, 1500 hp. El pináculo de la ingeniería automotriz.'
      },
      {
        marca: 'Pagani',
        modelo: 'Huayra Roadster',
        anio: 2020,
        precio: 55000000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Arte sobre ruedas en fibra de carbono y titanio.'
      },
      {
        marca: 'Ford',
        modelo: 'Mustang Shelby GT500',
        anio: 2023,
        precio: 2500000, 
        tipo: 'semideportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1547038577-d7ff7d353aef?q=80&w=2000&auto=format&fit=crop',
        detalles: 'V8 supercargado de 5.2L con 760 hp. El muscle car definitivo.'
      },
      {
        marca: 'Chevrolet',
        modelo: 'Corvette Z06',
        anio: 2024,
        precio: 3100000, 
        tipo: 'deportivo',
        estado: 'disponible',
        imagenUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop',
        detalles: 'Motor central V8 atmosférico plano de 5.5L con 670 hp.'
      }
    ]
  })

  // Insertar Audi R8 Especial con Colores
  await prisma.vehiculo.create({
    data: {
      marca: 'Audi',
      modelo: 'R8 V10 Exclusive',
      anio: 2024,
      precio: 4200000,
      tipo: 'deportivo',
      estado: 'disponible',
      imagenUrl: '/renders/audi_r8_red.jpg',
      detalles: 'Edición exclusiva con configurador fotorealista de fábrica.',
      colores: {
        create: [
          { nombre: 'Rojo Carmín', hex: '#d91e18', imagenUrl: '/renders/audi_r8_red.jpg' },
          { nombre: 'Azul Eléctrico', hex: '#1e90ff', imagenUrl: '/renders/audi_r8_blue.jpg' },
          { nombre: 'Negro Obsidiana', hex: '#111111', imagenUrl: '/renders/audi_r8_black.jpg' },
          { nombre: 'Plata Metálico', hex: '#d4d4d4', imagenUrl: '/renders/audi_r8_silver.jpg' },
        ]
      }
    }
  })

  console.log('Seeded database with cars and color variants!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
