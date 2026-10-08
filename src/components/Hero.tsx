import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import VehicleImage from "@/components/VehicleImage";
export default function Hero({ car }: { car?: Vehiculo }) {
  return <section className="collection-hero" aria-label="Vehículo destacado">
    <div className="hero-copy"><p className="eyebrow">Deportivos de alta gama</p><h1>El carácter se elige.<br />La emoción se conduce.</h1><p>Una colección extraordinaria. Encuentra tu próximo deportivo y hazlo tuyo.</p>
      <Link className="hero-action" href={car ? `/catalogo/${car.id}` : '/contacto'}>{car ? `Descubrir el ${car.marca} ${car.modelo.split(' ')[0]}` : 'Conoce la colección'} <ArrowUpRight size={18}/></Link></div>
    <div className="hero-image">{car && <><span className="hero-tag">{car.modelo} · {car.anio}</span><VehicleImage car={car} className="h-full w-full min-h-[320px]" /></>}</div>
    <div className="hero-summary"><div><small>Selección LocadedCar</small><br/><strong>{car ? `${car.marca} ${car.modelo}` : 'Deportivos de alta gama'}</strong></div><small className="hero-colors">Explora cada detalle</small>{car && <div><strong>{new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(car.precio)}</strong> <small>MXN</small></div>}</div>
  </section>;
}
