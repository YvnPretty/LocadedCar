"use client";

import { motion } from "framer-motion";
import { Search, Menu, Car } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
            <Car size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase">
            Locaded<span className="text-white/60">Car</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
          <Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link>
          <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} className="text-white/80" />
          </button>
          <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={20} className="text-white/80" />
          </button>
          <Link href="/contacto" className="hidden md:block glass-button px-5 py-2 rounded-full text-sm font-medium text-white">
            Agendar Cita
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
