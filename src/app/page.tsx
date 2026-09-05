import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  // Fetch autos desde SQLite
  const cars = await prisma.vehiculo.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen pb-24">
      <Hero />
      
      {/* Catálogo Section */}
      <section className="max-w-7xl mx-auto px-6 mt-12 relative z-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-2">
              Nuestra <span className="font-semibold">Colección</span>
            </h2>
            <p className="text-white/50 text-sm md:text-base max-w-lg">
              Explora nuestra cuidada selección de vehículos de alto rendimiento. Cada modelo ha sido inspeccionado para garantizar la máxima calidad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
        
        {cars.length === 0 && (
          <div className="text-center py-24 glass rounded-3xl">
            <p className="text-white/50">No hay vehículos disponibles en el catálogo en este momento.</p>
          </div>
        )}
      </section>
    </main>
  );
}
