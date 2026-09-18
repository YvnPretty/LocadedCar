"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/pos")) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10" : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          LOCADED<span className="text-white/50 font-light">CAR</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
            >
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] glass border border-white/10 rounded-2xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] uppercase font-semibold tracking-[0.2em] text-white/40 mb-3">Carrocerías</h4>
                      <div className="flex flex-col gap-2">
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Todos los Modelos</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Deportivo</Link>
                        <Link href="/catalogo" className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Semideportivo</Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-semibold tracking-[0.2em] text-white/40 mb-3">Nuestras Marcas</h4>
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

          <Link href="/nosotros" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Nosotros</Link>
          <Link href="/contacto" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Contacto</Link>
          <Link href="/checkout" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Comprar / Pago
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Abrir menú"
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white/80" />}
          </button>
          <Link href="/contacto" className="hidden md:block glass-button px-5 py-2 rounded-full text-sm font-medium text-white">
            Agendar Cita
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
              <Link href="/catalogo" onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">Catálogo</Link>
              <Link href="/nosotros" onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">Nosotros</Link>
              <Link href="/contacto" onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">Contacto</Link>
              <Link href="/checkout" onClick={() => setMobileOpen(false)} className="text-amber-400 hover:text-amber-300">Comprar / Pago</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
