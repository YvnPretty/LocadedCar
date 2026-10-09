import { vehicleName } from "@/lib/vehicle-media";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Gauge, Settings2, CheckCircle2, CreditCard } from "lucide-react";
import Link from "next/link";
import CarMediaViewer from "@/components/CarMediaViewer";



// Disable caching for params
export const dynamic = 'force-dynamic';

export default async function DetalleVehiculo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const car = await prisma.vehiculo.findUnique({
    where: { id },
    include: { colores: true }
  });

  if (!car) {
    notFound();
  }

  return (
    <main className="vehicle-detail min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Volver al catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Imagen / Visor Interactivo */}
          <CarMediaViewer
            key={car.id}
            vehicleId={car.id}
            imageUrl={car.imagenUrl || ""}
            brand={car.marca}
            model={car.modelo}
            status={car.estado}
            dbColors={car.colores}
          />

          {/* Columna Derecha: Detalles */}
          <div className="vehicle-detail-copy flex flex-col">
            <p className="eyebrow mb-3">{car.marca} · {car.tipo}</p>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-light tracking-tight text-ink mb-2">
              {vehicleName(car)}
            </h1>
            
            <p className="text-3xl font-light text-ink my-6">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(car.precio)}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3">
                <Gauge className="text-muted" />
                <div>
                  <p className="text-xs text-muted uppercase">Año</p>
                  <p className="text-lg font-medium text-ink">{car.anio}</p>
                </div>
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3">
                <Settings2 className="text-muted" />
                <div>
                  <p className="text-xs text-muted uppercase">Tipo</p>
                  <p className="text-lg font-medium text-ink capitalize">{car.tipo}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-ink mb-3">Especificaciones</h3>
              <p className="text-muted leading-relaxed text-lg">
                {car.detalles}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {car.estado === "disponible" ? (
                <Link 
                  href={`/checkout?vehiculoId=${car.id}`} 
                  className="vehicle-primary-action"
                >
                  <CreditCard size={18} />
                  Apartar vehículo
                </Link>
              ) : (
                <button 
                  disabled 
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface text-muted cursor-not-allowed font-medium text-center"
                >
                  Unidad Vendida
                </button>
              )}
              <Link href="/contacto" className="glass-button w-full sm:w-auto px-8 py-4 rounded-full text-ink font-medium flex items-center justify-center gap-2 group text-center">
                <CheckCircle2 size={18} />
                Agendar Cita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
