import CarCard from "@/components/CarCard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Catalogo() {
  const cars = await prisma.vehiculo.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen pt-32 pb-24">
      <section className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
            Catálogo <span className="font-semibold">Exclusivo</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Nuestra colección completa de vehículos de alta gama, verificados y listos para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
