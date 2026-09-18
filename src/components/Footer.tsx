"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sparkles, Terminal, LayoutDashboard, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // No renderizar en la terminal POS ni en el panel de administración
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/pos")) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-[#050507] text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Vision */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            LOCADED<span className="text-neutral-500 font-light">CAR</span>
          </Link>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Plataforma automotriz de superlujo para la exhibición, cotización personalizada y despacho transaccional de hiperdeportivos y vehículos de colección.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles size={13} />
            <span>EXCELLENCE IN MOTION</span>
          </div>
        </div>

        {/* Client Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Colección & Catálogo
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <Link href="/catalogo" className="hover:text-white transition-colors">
                Todos los Modelos
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-white transition-colors">
                Hiperdeportivos (V10 / V12)
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-white transition-colors">
                Gran Turismo & Semideportivos
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-amber-400 transition-colors">
                Pasarela de Compra VIP
              </Link>
            </li>
          </ul>
        </div>

        {/* Showroom & Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Showroom Master
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Av. Paseo de la Reforma 222, Cuauhtémoc, Ciudad de México.
          </p>
          <p className="text-xs text-neutral-400">
            Horario: Lun - Sáb, 09:00 - 20:00 hrs
          </p>
          <div className="pt-1">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              Agendar Cita Privada <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Staff & Corporate Gateway */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <Shield size={14} />
            <span>PORTAL CORPORATIVO</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-tight">
            Acceso reservado para equipo comercial, cajeros de piso y gerencia general:
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/pos"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
            >
              <span className="flex items-center gap-2">
                <Terminal size={14} /> Terminal POS (Caja)
              </span>
              <ArrowUpRight size={13} />
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-bold transition-all"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard size={14} /> Panel Administrador
              </span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
        <p>© 2026 LocadedCar Luxury Motors Platform. Todos los derechos reservados.</p>
        <p className="font-mono text-[11px] mt-2 sm:mt-0">SISTEMA EMPRESARIAL ISO 21500</p>
      </div>
    </footer>
  );
}
