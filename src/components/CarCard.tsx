"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Gauge, CalendarDays } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import Link from "next/link";

export default function CarCard({ car, index }: { car: Vehiculo; index: number }) {
  const price = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(car.precio);
  const available = car.estado === "disponible";
  return (
    <motion.article initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.55,delay:Math.min(index*.06,.3)}} className="group overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[#0a0a0b] transition duration-500 hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-[0_30px_80px_rgba(0,0,0,.45)]">
      <Link href={`/catalogo/${car.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
          <img src={car.imagenUrl || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop"} alt={`${car.marca} ${car.modelo}`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[9px] uppercase tracking-[.22em] text-white/65 backdrop-blur-xl">{car.tipo}</div>
          <div className={`absolute right-5 top-5 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[.18em] backdrop-blur-xl ${available?"border-emerald-400/25 bg-emerald-400/10 text-emerald-300":"border-white/10 bg-black/35 text-white/50"}`}>{car.estado}</div>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[10px] uppercase tracking-[.28em] text-white/45">{car.marca}</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-medium tracking-[-.035em]">{car.modelo}</h3>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] uppercase tracking-[.22em] text-white/30">Precio</p><p className="mt-1 text-xl font-medium tracking-tight">{price}</p></div>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition group-hover:bg-white group-hover:text-black"><ArrowUpRight size={18}/></span>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs text-white/42">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13}/>{car.anio}</span><span className="text-white/15">/</span><span className="inline-flex items-center gap-1.5"><Gauge size={13}/>Performance</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
