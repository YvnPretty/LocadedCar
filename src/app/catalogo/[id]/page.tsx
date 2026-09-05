import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { ArrowLeft, Gauge, Settings2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

// Disable caching for params
export const dynamic = 'force-dynamic';

export default async function DetalleVehiculo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const car = await prisma.vehiculo.findUnique({
    where: { id }
  });

  if (!car) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Volver al catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna Izquierda: Imagen */}
          <div className="relative aspect-video rounded-3xl overflow-hidden glass">
            <img 
              src={car.imagenUrl || ""} 
              alt={`${car.marca} ${car.modelo}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
                car.estado === 'disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {car.estado.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-light tracking-tight text-white mb-2">
              <span className="font-semibold">{car.marca}</span> {car.modelo}
            </h1>
            
            <p className="text-4xl font-light text-white my-6">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(car.precio)}
            </p>

            <div className="flex gap-4 mb-8">
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3">
                <Gauge className="text-white/40" />
                <div>
                  <p className="text-xs text-white/40 uppercase">Año</p>
                  <p className="text-lg font-medium text-white">{car.anio}</p>
                </div>
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3">
                <Settings2 className="text-white/40" />
                <div>
                  <p className="text-xs text-white/40 uppercase">Tipo</p>
                  <p className="text-lg font-medium text-white capitalize">{car.tipo}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-white mb-3">Especificaciones</h3>
              <p className="text-white/60 leading-relaxed text-lg">
                {car.detalles}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Link href="/contacto" className="glass-button w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 group text-center">
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
