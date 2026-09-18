"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  CreditCard,
  FileText,
  Terminal,
  ExternalLink,
  LogOut,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard Ejecutivo",
      href: "/admin",
      icon: LayoutDashboard,
      badge: "KPIs"
    },
    {
      name: "Inventario de Autos",
      href: "/admin/inventario",
      icon: Car,
      badge: null
    },
    {
      name: "Clientes VIP (CRM)",
      href: "/admin/clientes",
      icon: Users,
      badge: null
    },
    {
      name: "Auditoría de Ventas",
      href: "/admin/ventas",
      icon: CreditCard,
      badge: "Transacciones"
    },
    {
      name: "Cotizaciones Web",
      href: "/admin/cotizaciones",
      icon: FileText,
      badge: "Leads"
    }
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP EXECUTIVE BAR */}
      <header className="sticky top-0 z-40 bg-[#090b0f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-cyan-500/20">
              AD
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-sm text-white">
                LOCADED<span className="text-cyan-400 font-light">ADMIN</span>
              </span>
              <span className="text-[9px] block text-neutral-500 font-mono leading-none">
                CONSOLA GERENCIAL // V2.0
              </span>
            </div>
          </Link>

          <span className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono">
            <ShieldCheck size={12} /> ROL: SUPERADMINISTRADOR
          </span>
        </div>

        {/* ROLE QUICK SWITCHER */}
        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Abrir Terminal de Cobro POS"
          >
            <Terminal size={14} />
            <span className="hidden sm:inline">Abrir Terminal POS</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Ver catálogo público como cliente"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Vista de Cliente</span>
          </Link>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              GD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">Gabriel Domínguez</p>
              <p className="text-[10px] text-neutral-400">Director General</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-white/10 bg-[#08090d] flex flex-col p-4 space-y-6 hidden md:flex">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
              Módulos de Gestión
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-lg shadow-cyan-500/5"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-cyan-400" : "text-neutral-400"} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                        isActive
                          ? "bg-cyan-400 text-black font-bold"
                          : "bg-white/5 text-neutral-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Access to Operational Station */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Operación en Mostrador
            </p>
            <Link
              href="/pos"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Terminal size={16} />
              <span>Terminal POS (Ventas)</span>
            </Link>
          </div>

          {/* System Footer Info */}
          <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400 space-y-1">
              <p className="text-white font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" /> LocadedCar OS
              </p>
              <p className="text-[10px]">Motor Prisma ORM v5.22</p>
              <p className="text-[10px] text-neutral-500 font-mono">SQLite Transaccional</p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Salir al Portal Público</span>
            </Link>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-57px)]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
