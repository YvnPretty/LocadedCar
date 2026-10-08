import VehicleImage from "@/components/VehicleImage";
import { vehicleName } from "@/lib/vehicle-media";
import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import {
  CreditCard,
  TrendingUp,
  Download,
  Search,
  Filter,
  Car,
  UserCheck,
  Calendar,
  ShieldCheck,
  Terminal,
  Printer
} from "lucide-react";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function AdminVentasPage() {
  const transacciones = await prisma.transaccion.findMany({
    include: {
      vehiculo: {
        include: { colores: true }
      },
      cliente: true,
      vendedor: true
    },
    orderBy: { fecha: "desc" }
  });

  const totalVentas = transacciones.reduce((acc, curr) => acc + curr.montoTotal, 0);
  const ticketPromedio = transacciones.length > 0 ? totalVentas / transacciones.length : 0;

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-brand text-[10px] font-sans font-bold">
              LIBRO MAYOR DE TRANSACCIONES
            </span>
            <span className="text-xs text-muted">ISO 21500 / PMBOK</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink mt-1">Auditoría Financiera de Ventas</h1>
          <p className="text-xs text-muted">
            Registro inmutable de todas las operaciones comerciales concretadas en Terminal POS y Pasarela Web.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-brand border border-emerald-500/30 text-xs font-bold transition-all"
          >
            <Terminal size={15} /> Nueva Venta POS
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Ingresos Acumulados</span>
          <p className="text-2xl font-semibold text-brand font-sans mt-1">
            {formatMXN(totalVentas)}
          </p>
          <span className="text-[11px] text-muted">Monto total liquidado en libros</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Total de Despachos</span>
          <p className="text-2xl font-semibold text-ink font-sans mt-1">
            {transacciones.length} <span className="text-xs font-normal text-muted">operaciones</span>
          </p>
          <span className="text-[11px] text-brand">100% de operaciones atómicas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line">
          <span className="text-[10px] font-sans uppercase text-muted">Ticket Promedio por Auto</span>
          <p className="text-2xl font-semibold text-brand font-sans mt-1">
            {formatMXN(ticketPromedio)}
          </p>
          <span className="text-[11px] text-muted">Segmento Hiperdeportivo / Exótico</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <CreditCard size={16} className="text-brand" /> Detalle de Pólizas Transaccionales
          </h3>
          <span className="text-xs font-sans text-muted">
            {transacciones.length} registros oficiales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-white border-b border-line text-muted uppercase font-sans text-[10px]">
              <tr>
                <th className="py-3 px-4">Folio Fiscal</th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Vehículo Despachado</th>
                <th className="py-3 px-4">Comprador Titular</th>
                <th className="py-3 px-4">Asesor Autorizado</th>
                <th className="py-3 px-4 text-right">Importe Liquidado</th>
                <th className="py-3 px-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transacciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    Aún no se registran pólizas de venta. Ingresa a la Terminal POS para emitir una nueva transacción.
                  </td>
                </tr>
              ) : (
                transacciones.map((t) => (
                  <tr key={t.id} className="hover:bg-white transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-brand">
                      LCD-POS-{new Date(t.fecha).getFullYear()}-{t.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {new Date(t.fecha).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {t.vehiculo.imagenUrl && (
                          <VehicleImage car={t.vehiculo} className="w-10 h-7  rounded-md border border-line" />
                        )}
                        <div>
                          <p className="font-bold text-ink leading-tight">
                            {t.vehiculo.marca} {vehicleName(t.vehiculo)}
                          </p>
                          <p className="text-[10px] text-muted font-sans">
                            Año {t.vehiculo.anio} • {t.vehiculo.tipo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      <p className="font-semibold text-ink">{t.cliente.nombre}</p>
                      <p className="text-[10px] text-muted font-sans">{t.cliente.correo}</p>
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      <span className="font-medium text-muted">{t.vendedor.nombre}</span>
                      <span className="block text-[10px] text-muted font-sans">Cajero Activo</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-brand text-right text-sm">
                      {formatMXN(t.montoTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-brand border border-emerald-500/30">
                        <ShieldCheck size={11} /> Aprobado
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
  );
}
