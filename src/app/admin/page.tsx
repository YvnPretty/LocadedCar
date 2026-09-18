import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import {
  DollarSign,
  Car,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminDashboardPage() {
  // Fetch real-time statistics from database
  const [transacciones, vehiculos, clientes, vendedores] = await Promise.all([
    prisma.transaccion.findMany({
      include: {
        vehiculo: true,
        cliente: true,
        vendedor: true,
      },
      orderBy: { fecha: "desc" },
    }),
    prisma.vehiculo.findMany({
      include: { colores: true },
    }),
    prisma.cliente.findMany(),
    prisma.vendedor.findMany(),
  ]);

  const totalIngresos = transacciones.reduce((acc, curr) => acc + curr.montoTotal, 0);
  const totalVendidos = vehiculos.filter((v) => v.estado === "vendido").length;
  const totalDisponibles = vehiculos.filter((v) => v.estado === "disponible").length;
  const totalApartados = vehiculos.filter((v) => v.estado === "apartado").length;
  const valorInventarioPiso = vehiculos
    .filter((v) => v.estado === "disponible")
    .reduce((acc, curr) => acc + curr.precio, 0);

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
              CONSOLA DE MANDO EMPRESARIAL
            </span>
            <span className="text-xs text-neutral-400">• Actualización en tiempo real</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Resumen General de Operaciones
          </h1>
          <p className="text-xs text-neutral-400">
            Control centralizado de flota de hiperdeportivos, ingresos de mostrador y cartera de clientes VIP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20"
          >
            <Terminal size={16} />
            Lanzar Terminal POS
          </Link>
          <Link
            href="/admin/inventario"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10"
          >
            <Car size={16} />
            Gestionar Flota
          </Link>
        </div>
      </div>

      {/* 4 KEY EXECUTIVE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">Ingresos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono mt-3">
            {formatMXN(totalIngresos)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp size={13} />
            <span>{transacciones.length} Transacciones Liquidadas</span>
          </div>
        </div>

        {/* KPI 2: Available Inventory Valuation */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">Valor de Flota en Piso</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Car size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono mt-3">
            {formatMXN(valorInventarioPiso)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>{totalDisponibles} Unidades listas para entrega</span>
          </div>
        </div>

        {/* KPI 3: Units Sold / Despachadas */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">Despacho de Unidades</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono mt-3">
            {totalVendidos} <span className="text-xs font-normal text-neutral-400">Autos Vendidos</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
            <span>{totalApartados} con Anticipo / Apartados</span>
          </div>
        </div>

        {/* KPI 4: Registered VIP Clients */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">Cartera de Clientes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono mt-3">
            {clientes.length} <span className="text-xs font-normal text-neutral-400">Titulares</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
            <span>100% Leads Verificados</span>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS AUDIT TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Últimas Transacciones Registradas</h2>
          </div>

          <Link
            href="/admin/ventas"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            Ver Auditoría Completa <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/5 border-b border-white/10 text-neutral-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Folio / ID</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Vehículo</th>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Asesor</th>
                  <th className="py-3 px-4 text-right">Monto Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transacciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      No hay transacciones registradas aún. Abre la Terminal POS para procesar la primera venta.
                    </td>
                  </tr>
                ) : (
                  transacciones.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {t.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {new Date(t.fecha).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {t.vehiculo.marca} {t.vehiculo.modelo} ({t.vehiculo.anio})
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {t.cliente.nombre}
                        <span className="block text-[10px] text-neutral-500">{t.cliente.correo}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {t.vendedor.nombre}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-right">
                        {formatMXN(t.montoTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Liquidado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FLEET AVAILABILITY PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">Resumen de Flota en Showroom</h2>
          </div>
          <Link
            href="/admin/inventario"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Editar Catálogo <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehiculos.slice(0, 3).map((car) => (
            <div
              key={car.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-4 hover:border-white/20 transition-all"
            >
              <img
                src={car.imagenUrl || "/renders/audi_r8_red.jpg"}
                alt={car.modelo}
                className="w-20 h-16 object-cover rounded-xl border border-white/10"
              />
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-mono uppercase text-amber-400">{car.marca}</span>
                <h4 className="text-sm font-bold text-white truncate">{car.modelo}</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-black text-neutral-300">
                    {formatMXN(car.precio)}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      car.estado === "disponible"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {car.estado}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
