"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10" : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          LOCADED<span className="text-white/50 font-light">CAR</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {/* Dropdown de Modelos */}
          <div 
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors py-2">
              Modelos
              <ChevronDown size={14} className={`transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] glass border border-white/10 rounded-2xl p-6 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-white/40 mb-3">Carrocerías</h4>
                      <div className="flex flex-col gap-2">
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Todos los Modelos</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Deportivo</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Semideportivo</Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-white/40 mb-3">Nuestras Marcas</h4>
                      <div className="flex flex-col gap-2">
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Mercedes-Benz</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Porsche</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Lamborghini</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Bugatti</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Ferrari</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Pagani</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/nosotros" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Nosotros
          </Link>
          <Link href="/contacto" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Contacto
          </Link>
        </div>

        <div className="flex items-center gap-4">
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
