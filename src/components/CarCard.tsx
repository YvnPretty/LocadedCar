import VehicleImage from "@/components/VehicleImage";
import { ArrowUpRight } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import Link from "next/link";
export default function CarCard({ car }: { car: Vehiculo; index?: number }) {
  return <article className="collection-card">
    <div className="car-image"><span className="car-status capitalize">{car.estado}</span><VehicleImage car={car} sizes="(min-width: 1440px) 446px, (min-width: 768px) 33vw, 100vw" className="w-full h-full" /></div>
    <div className="car-copy"><p className="car-meta">{car.marca} · {car.anio}</p><h3>{car.modelo}</h3><div className="flex justify-between text-sm text-muted"><span className="capitalize">{car.tipo}</span><span>MXN</span></div>
      <div className="car-bottom"><strong className="font-normal">{new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(car.precio)}</strong><Link href={`/catalogo/${car.id}`} aria-label={`Ver modelo ${car.marca} ${car.modelo}`}>Ver modelo <ArrowUpRight size={16}/></Link></div>
    </div>
  </article>;
}
