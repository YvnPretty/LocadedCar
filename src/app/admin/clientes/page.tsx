import { getAdminSession } from '@/lib/admin/access';
import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  Car,
  DollarSign,
  TrendingUp,
  Sparkles,
  Terminal,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminClientesPage() {
 if (!await getAdminSession()) return null;
  const clientes = await prisma.cliente.findMany({
    include: {
      transacciones: {
        include: { vehiculo: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalInvertidoPorClientes = clientes.reduce(
    (acc, c) => acc + c.transacciones.reduce((sub, t) => sub + t.montoTotal, 0),
    0
  );

  const clientesConCompras = clientes.filter((c) => c.transacciones.length > 0).length;

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-brand text-[10px] font-sans font-bold">
              CRM & FIDELIZACIÓN VIP
            </span>
            <span className="text-xs text-muted">Directorio de Compradores y Prospectos</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink mt-1">Cartera de Clientes & Relaciones</h1>
          <p className="text-xs text-muted">
            Historial de adquisiciones, tickets promedio por titular y canales de contacto directo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-brand border border-emerald-500/30 text-xs font-bold transition-all"
          >
            <Terminal size={15} /> Atender en POS
          </Link>
        </div>
      </div>

      {/* CRM Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Titulares Registrados</span>
          <p className="text-2xl font-semibold text-ink font-sans mt-1">{clientes.length}</p>
          <span className="text-[11px] text-brand">Cartera privada de inversionistas</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Compradores Activos</span>
          <p className="text-2xl font-semibold text-brand font-sans mt-1">
            {clientesConCompras} <span className="text-xs font-normal text-muted">con unidades</span>
          </p>
          <span className="text-[11px] text-muted">Conversión a venta exitosa</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Capital Desembolsado en Agencia</span>
          <p className="text-2xl font-semibold text-brand font-sans mt-1">
            {formatMXN(totalInvertidoPorClientes)}
          </p>
          <span className="text-[11px] text-muted">Valor LTV acumulado</span>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted bg-white border border-line rounded-2xl">
            No hay clientes registrados en la base de datos todavía.
          </div>
        ) : (
          clientes.map((c) => {
            const totalGastado = c.transacciones.reduce((acc, t) => acc + t.montoTotal, 0);
            const esVIP = c.transacciones.length > 0;

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-line flex flex-col justify-between gap-4 hover:border-purple-500/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase ${
                          esVIP
                            ? "bg-accent/20 text-brand border border-accent/30"
                            : "bg-neutral-700/50 text-muted border border-neutral-600/30"
                        }`}
                      >
                        {esVIP ? "TITULAR PROPIETARIO VIP" : "PROSPECTO EN SEGUIMIENTO"}
                      </span>
                      <h3 className="text-lg font-bold text-ink pt-1">{c.nombre}</h3>
                    </div>

                    {totalGastado > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-muted block font-sans">Inversión LTV</span>
                        <span className="text-sm font-semibold text-brand font-sans">
                          {formatMXN(totalGastado)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vehicles Purchased List */}
                  {c.transacciones.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-line space-y-1.5">
                      <span className="text-[10px] font-sans uppercase text-brand font-bold block">
                        Unidades Despachadas ({c.transacciones.length}):
                      </span>
                      <div className="space-y-1">
                        {c.transacciones.map((t) => (
                          <div key={t.id} className="flex justify-between text-xs text-muted">
                            <span>🏎️ {t.vehiculo.marca} {t.vehiculo.modelo} ({t.vehiculo.anio})</span>
                            <span className="font-sans text-brand">{formatMXN(t.montoTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Channels */}
                  <div className="mt-3 space-y-1.5 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-muted" />
                      <a href={`mailto:${c.correo}`} className="hover:text-ink transition-colors">
                        {c.correo}
                      </a>
                    </div>
                    {c.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-muted" />
                        <a href={`tel:${c.telefono}`} className="hover:text-ink transition-colors">
                          {c.telefono}
                        </a>
                      </div>
                    )}
                    {c.direccion && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted">Entrega:</span>
                        <span className="text-muted truncate">{c.direccion}{c.ciudad ? `, ${c.ciudad}` : ""}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-[10px] text-muted font-sans">
                    Registrado: {new Date(c.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${c.correo}?subject=Atención Personalizada LocadedCar`}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-white text-ink font-bold text-xs transition-colors"
                    >
                      Enviar Correo
                    </a>
                    <Link
                      href="/pos"
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-xs transition-colors"
                    >
                      Cobrar en POS
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
