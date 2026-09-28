import CatalogGrid from "@/components/CatalogGrid";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function Catalogo({ searchParams }: { searchParams: Promise<{ marca?: string; tipo?: string; todos?: string }> }) {
  const filters = await searchParams;
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

        <CatalogGrid key={`${filters.marca || ""}-${filters.tipo || ""}-${filters.todos || ""}`} cars={cars} requestedBrand={filters.marca} requestedType={filters.tipo} resetFilters={filters.todos === "1"} />
      </section>
    </main>
  );
}
