"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Abstract Background for Premium Feel */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111]" />
        
        {/* Subtle blurred orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium tracking-widest text-white/70 mb-6">
            INNOVACIÓN & ELEGANCIA
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl font-light tracking-tight mb-8"
        >
          Experimenta la <br className="hidden md:block"/> 
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
            Adrenalina Pura.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light max-w-2xl mx-auto"
        >
          Descubre nuestra colección exclusiva de vehículos deportivos y semideportivos. Diseño, potencia y estatus al alcance de tus manos.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="glass-button w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 group">
            Ver Catálogo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-full text-white/70 font-medium hover:text-white transition-colors">
            Conocer más
          </button>
        </motion.div>
      </div>
    </div>
  );
}
