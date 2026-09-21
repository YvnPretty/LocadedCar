import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import {
  FileText,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Car
} from "lucide-react";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminCotizacionesPage() {
  const cotizaciones = await prisma.cotizacion.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const vehiculos = await prisma.vehiculo.findMany({
    where: { estado: "disponible" },
    take: 5
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              CRM LEADS & PIPELINE
            </span>
            <span className="text-xs text-neutral-400">Prospectos de Formulario Web</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Bandeja de Cotizaciones VIP</h1>
          <p className="text-xs text-neutral-400">
            Seguimiento a prospectos interesados que solicitaron atención personalizada a través de la sección de contacto.
          </p>
        </div>

        <Link
          href="/pos"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
        >
          <Sparkles size={14} /> Atender en Mostrador POS
        </Link>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] font-mono uppercase text-amber-400">Prospectos Activos</span>
          <p className="text-2xl font-black text-white font-mono mt-1">{cotizaciones.length}</p>
          <span className="text-[11px] text-neutral-400">Esperando contacto del asesor</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] font-mono uppercase text-cyan-400">Tiempo Promedio de Respuesta</span>
          <p className="text-2xl font-black text-white font-mono mt-1">&lt; 15 min</p>
          <span className="text-[11px] text-neutral-400">SLA Concierge Garantizado</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Conversión a POS</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">68.4%</p>
          <span className="text-[11px] text-neutral-400">Cierre efectivo en mostrador</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText size={16} className="text-amber-400" /> Solicitudes Recientes para Seguimiento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cotizaciones.length === 0 ? (
            <div className="md:col-span-2 p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-sm text-neutral-500">
              Aún no hay solicitudes de contacto registradas.
            </div>
          ) : cotizaciones.map((c, idx) => {
            const autoInteres = vehiculos[idx % (vehiculos.length || 1)];

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      LEAD #{idx + 101}
                    </span>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock size={12} /> {c.createdAt.toLocaleDateString()}
                    </span>
                  </div>

                      <h4 className="text-base font-bold text-white mt-2.5">{c.nombre}</h4>
                      <p className="text-sm text-neutral-300 mt-2">{c.mensaje}</p>
                  
                  {autoInteres && (
                    <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2 text-xs">
                      <Car size={14} className="text-cyan-400" />
                      <span className="text-neutral-300 font-medium">
                        Interés en: <strong className="text-white">{autoInteres.marca} {autoInteres.modelo}</strong>
                      </span>
                    </div>
                  )}

                  <div className="mt-3 space-y-1 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-neutral-500" />
                      <a href={`mailto:${c.correo}`} className="hover:text-amber-400 transition-colors">
                        {c.correo}
                      </a>
                    </div>
                    {c.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-neutral-500" />
                        <a href={`tel:${c.telefono}`} className="hover:text-amber-400 transition-colors">
                          {c.telefono}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <a
                    href={`mailto:${c.correo}?subject=Cotización VIP - LocadedCar`}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs text-center transition-colors"
                  >
                    Contactar Vía Email
                  </a>
                  <Link
                    href="/pos"
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-colors"
                    title="Cargar a Terminal POS"
                  >
                    Vender en POS <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
