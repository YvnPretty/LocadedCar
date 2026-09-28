"use client";
import { useEffect, useState } from 'react';
type Summary = { stats: { totalRecaudado: number; totalTransacciones: number; vehiculosDisponibles: number }; recientes: { id: string; fecha: string; montoTotal: number; vehiculo: { marca: string; modelo: string } }[] };
const currency = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
export default function SalesSummary() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/pos/stats', { signal: controller.signal, cache: 'no-store' })
      .then(async res => { if (!res.ok) throw new Error('No se pudo consultar el historial.'); return res.json(); })
      .then(setData).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [attempt]);
  if (error) return <div role="alert" className="py-6 text-red-300">{error}<button className="block mt-3 underline" onClick={() => { setError(''); setAttempt(n => n + 1); }}>Reintentar</button></div>;
  if (!data) return <p role="status" className="py-6">Cargando transacciones…</p>;
  return <section className="space-y-5 py-6">
    <div><p className="text-sm text-neutral-400">Importe registrado · histórico</p><p className="text-3xl font-bold text-emerald-400 break-all">{currency(data.stats.totalRecaudado)}</p></div>
    <div className="grid grid-cols-2 gap-3 text-sm"><p>{data.stats.totalTransacciones} transacciones</p><p>{data.stats.vehiculosDisponibles} disponibles</p></div>
    <h4 className="font-semibold">Últimas transacciones</h4>
    {!data.recientes.length && <p className="text-neutral-400">Todavía no hay transacciones.</p>}
    <ul className="space-y-3">{data.recientes.map(sale => <li key={sale.id} className="rounded-xl border border-white/10 p-3 text-sm"><p>{sale.vehiculo.marca} {sale.vehiculo.modelo}</p><p className="text-amber-300 font-semibold">{currency(sale.montoTotal)}</p><time className="text-neutral-400">{new Date(sale.fecha).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</time></li>)}</ul>
  </section>;
}
