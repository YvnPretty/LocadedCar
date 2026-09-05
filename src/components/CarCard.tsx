"use client";

import { motion } from "framer-motion";
import { ArrowRight, Settings2, Gauge } from "lucide-react";
import type { Vehiculo } from "@prisma/client";

export default function CarCard({ car, index }: { car: Vehiculo; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative rounded-3xl overflow-hidden glass hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] cursor-pointer"
    >
      {/* Etiqueta de Estado */}
      <div className="absolute top-4 right-4 z-20">
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md border ${
          car.estado === "disponible" 
            ? "bg-green-500/20 text-green-300 border-green-500/30" 
            : "bg-red-500/20 text-red-300 border-red-500/30"
        }`}>
          {car.estado.toUpperCase()}
        </span>
      </div>

      {/* Imagen del Auto */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src={car.imagenUrl || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop"} 
          alt={`${car.marca} ${car.modelo}`} 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        
        {/* Título sobrepuesto en la imagen */}
        <div className="absolute bottom-4 left-5 z-20">
          <p className="text-white/60 text-sm font-medium tracking-wide uppercase">{car.marca}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{car.modelo}</h3>
        </div>
      </div>

      {/* Detalles del Auto */}
      <div className="p-6 bg-gradient-to-b from-[#0a0a0a]/90 to-[#111111]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-3xl font-light text-white">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(car.precio)}
          </p>
        </div>

        <p className="text-white/50 text-sm mb-6 line-clamp-2 min-h-[40px]">
          {car.detalles}
        </p>

        {/* Specs Rápidas */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
            <Gauge size={14} className="text-white/40" />
            <span>{car.anio}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-3 py-2 rounded-xl border border-white/5 uppercase">
            <Settings2 size={14} className="text-white/40" />
            <span>{car.tipo}</span>
          </div>
        </div>

        <button className="w-full glass-button py-3 rounded-2xl text-white text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-white/10">
          Ver Detalles
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
