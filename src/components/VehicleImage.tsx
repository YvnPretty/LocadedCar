"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { isReferenceImage, resolveVehicleImage, vehicleName, type VehicleIdentity } from '@/lib/vehicle-media';

export default function VehicleImage({ car, src, className = '', showCredit = false, sizes = '(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw', eager = false }: {
  car: VehicleIdentity; src?: string | null; className?: string; showCredit?: boolean; sizes?: string; eager?: boolean;
}) {
  const resolved = resolveVehicleImage(car, src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const name = vehicleName(car);
  return <div className={`relative overflow-hidden bg-[#14171c] ${className}`}>
    {resolved && failedSrc !== resolved ? <Image
      src={resolved} alt={`${name}${car.anio ? ` · Año registrado: ${car.anio}` : ''}${isReferenceImage(car, resolved) ? ' · Foto de referencia del modelo' : ''}`}
      fill unoptimized={!resolved.startsWith('/')} sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"}
      className="object-contain" onError={() => setFailedSrc(resolved)}
    /> : <div role="img" aria-label={`Foto pendiente: ${name}`} className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-neutral-400">
      <span className="text-xs">Foto pendiente</span><span className="text-xs">{name}</span>
    </div>}
    {showCredit && resolved && isReferenceImage(car, resolved) && <Link href="/creditos-imagenes" onClick={event => event.stopPropagation()} className="absolute left-2 top-2 z-30 rounded bg-black/80 px-2 py-1 text-[10px] text-white hover:underline">Foto de referencia · Créditos</Link>}
  </div>;
}
