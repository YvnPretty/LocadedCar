"use client";

import { useEffect, useState } from "react";
import "../pos.css";
import Link from "next/link";
import { Search, Receipt, ArrowLeft, RefreshCw } from "lucide-react";
import POSTicketModal, { type POSTicketData } from "@/components/POSTicketModal";

type Payment = {
  id: string; folio: string; fecha: string; montoTotal: number; metodoPago: string | null; modalidad: string | null;
  cliente: { nombre: string; correo: string }; vehiculo: { marca: string; modelo: string; anio: number };
  receipt: POSTicketData | null;
};
const methods: Record<string, string> = { tarjeta: "Tarjeta · registro demo", contactless: "Tap iPhone · simulación", spei: "SPEI · registro demo", efectivo: "Efectivo", financiamiento: "Financiamiento · demo" };
const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function PaymentHistory() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [receipt, setReceipt] = useState<POSTicketData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/pos/transaccion?q=${encodeURIComponent(query)}&page=${page}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo consultar el historial.");
        if (controller.signal.aborted) return;
        setPayments(data.data); setPages(data.pages); setTotal(data.total);
      }).catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "No se pudo consultar el historial."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, page, revision]);

  return (
    <main className="min-h-screen bg-[#060709] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/pos" className="flex items-center gap-2 text-sm text-amber-300"><ArrowLeft size={18} /> Volver al POS</Link>
          <Link href="/admin/ventas" className="text-sm text-neutral-400">Ver ventas en administración</Link>
        </div>
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">LocadedCar · Operaciones</p>
          <h1 className="text-3xl font-black">Buscar pagos</h1>
          <p className="text-sm text-neutral-400">Encuentra pagos registrados y recupera tus recibos. Los pagos con tarjeta, SPEI y Tap son demostraciones.</p>
        </header>
        <form onSubmit={event => { event.preventDefault(); setLoading(true); setError(""); setPage(1); setQuery(input.trim()); setRevision(r => r + 1); }} className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="min-w-0 flex-1 basis-72">
            <span className="mb-2 block text-sm text-neutral-300">Folio, nombre, correo, teléfono, marca o modelo</span>
            <input value={input} maxLength={250} onChange={event => setInput(event.target.value)} placeholder="Ej. LCD-POS-…, César o Porsche" className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-amber-400" />
          </label>
          <button type="submit" className="self-end flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-black"><Search size={18} /> Buscar</button>
          <button type="button" aria-label="Actualizar historial" onClick={() => { setLoading(true); setError(""); setRevision(r => r + 1); }} className="self-end rounded-xl border border-white/15 p-3 text-neutral-300"><RefreshCw size={20} /></button>
        </form>
        <section aria-live="polite" aria-busy={loading}>
          {loading ? <p className="py-12 text-center text-neutral-400">Consultando pagos…</p> : error ? (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-red-300">{error}<button onClick={() => { setLoading(true); setError(""); setRevision(r => r + 1); }} className="ml-3 underline">Reintentar</button></div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-12 text-center"><Receipt className="mx-auto mb-3 text-neutral-500" /><p>{query ? "No encontramos pagos con esos datos." : "Todavía no hay pagos registrados."}</p><p className="mt-2 text-sm text-neutral-400">{query ? "Prueba con el folio o el correo del comprador." : "Registra una operación desde el POS para verla aquí."}</p></div>
          ) : (
            <>
              <p className="mb-4 text-sm text-neutral-400">{total} pago{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {payments.map(payment => (
                  <article key={payment.id} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{payment.vehiculo.marca} {payment.vehiculo.modelo}</h2><p className="text-sm text-neutral-500">{payment.vehiculo.anio} · {new Date(payment.fecha).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</p></div><p className="font-bold text-emerald-300">{currency.format(payment.montoTotal)}</p></div>
                    <p className="break-all font-mono text-xs text-amber-300">{payment.folio}</p>
                    <div className="text-sm"><p>{payment.cliente.nombre}</p><p className="break-all text-neutral-400">{payment.cliente.correo}</p></div>
                    <p className="text-xs text-neutral-400">{methods[payment.metodoPago || ""] || "Método no registrado (operación anterior)"} · {payment.modalidad === "apartado_10" ? "Apartado del 10%" : payment.modalidad === "personalizado" ? "Anticipo personalizado" : payment.modalidad === "contado" ? "Pago total" : "Modalidad no registrada"}</p>
                    {payment.receipt ? <button onClick={() => setReceipt(payment.receipt)} className="flex items-center gap-2 rounded-xl border border-amber-400/30 px-4 py-2 text-sm font-bold text-amber-300"><Receipt size={16} /> Ver / imprimir recibo</button> : <p className="text-xs text-neutral-500">Operación anterior: no tiene un recibo guardado.</p>}
                  </article>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-4"><button disabled={page <= 1} onClick={() => { setLoading(true); setPage(p => p - 1); }} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">Anterior</button><span className="text-sm text-neutral-400">{page} / {pages}</span><button disabled={page >= pages} onClick={() => { setLoading(true); setPage(p => p + 1); }} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">Siguiente</button></div>
            </>
          )}
        </section>
      </div>
      <POSTicketModal isOpen={!!receipt} onClose={() => setReceipt(null)} ticket={receipt} />
    </main>
  );
}
