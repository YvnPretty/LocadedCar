"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Gauge, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111]" />

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.16, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-20 w-[28rem] h-[28rem] bg-orange-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-medium tracking-[0.32em] text-white/70 mb-6 uppercase">
            <Sparkles size={12} className="text-amber-300" />
            innovación & elegancia
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl font-light tracking-tight mb-8"
        >
          Experimenta la <br className="hidden md:block" />
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
            Adrenalina Pura.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="text-lg md:text-xl text-white/55 mb-10 font-light max-w-2xl mx-auto"
        >
          Descubre una colección exclusiva de vehículos deportivos y semideportivos. Diseño, potencia y estatus al alcance de tus manos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/catalogo" className="glass-button w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 group shadow-[0_10px_35px_rgba(255,255,255,0.08)]">
            Ver Catálogo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/nosotros" className="w-full sm:w-auto px-8 py-4 rounded-full text-white/75 font-medium hover:text-white transition-colors border border-white/10 bg-white/5">
            Conocer más
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-left sm:text-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/70 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-sm">Inventario verificado</span>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/70 backdrop-blur-sm">
            <Gauge size={16} className="text-sky-400" />
            <span className="text-sm">Entrega premium</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
