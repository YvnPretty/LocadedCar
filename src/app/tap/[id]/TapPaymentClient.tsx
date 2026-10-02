"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

type SessionStatus = "pending" | "approved" | "declined" | "expired";

interface PaymentSession {
  id: string;
  amount: number;
  vehicle: string;
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
}

export default function TapPaymentClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatMXN = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/contactless/${sessionId}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "No se pudo consultar el pago.");
      setSession(data.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar el pago.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const respond = async (action: "approve" | "decline") => {
    if (submitting || session?.status !== "pending") return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/payments/contactless/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "No se pudo responder al pago.");
      setSession(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo responder al pago.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusView = () => {
    if (!session) return null;

    if (session.status === "approved") {
      return (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={42} />
          <p className="font-black text-emerald-300">PAGO APROBADO</p>
          <p className="mt-1 text-sm text-neutral-300">
            La terminal LocadedCar recibirá la confirmación automáticamente.
          </p>
        </div>
      );
    }

    if (session.status === "declined") {
      return (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-center">
          <XCircle className="mx-auto mb-2 text-red-400" size={42} />
          <p className="font-black text-red-300">PAGO RECHAZADO</p>
          <p className="mt-1 text-sm text-neutral-300">La venta no será registrada.</p>
        </div>
      );
    }

    if (session.status === "expired") {
      return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-center">
          <XCircle className="mx-auto mb-2 text-amber-400" size={42} />
          <p className="font-black text-amber-300">SESIÓN EXPIRADA</p>
          <p className="mt-1 text-sm text-neutral-300">
            Regrese al POS y genere una nueva sesión.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void respond("approve")}
          className="min-h-14 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
        >
          Aprobar pago
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void respond("decline")}
          className="min-h-14 rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#060709] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="flex items-center justify-center gap-2 text-sm font-black tracking-widest">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-black">
            LC
          </span>
          LOCADED<span className="font-light text-amber-400">TAP</span>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] shadow-2xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/15 to-cyan-500/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10">
                <Smartphone className="text-amber-300" size={24} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Tap to Pay · Simulación
                </p>
                <h1 className="text-xl font-black">Pago sin contacto</h1>
              </div>
              <Radio className="ml-auto animate-pulse text-cyan-400" size={22} />
            </div>
          </div>

          <div className="space-y-5 p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-neutral-400">
                <RefreshCw className="animate-spin" size={18} />
                Consultando terminal…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-3 block underline"
                >
                  Reintentar
                </button>
              </div>
            ) : session ? (
              <>
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Unidad</p>
                  <p className="mt-1 font-bold text-neutral-100">{session.vehicle}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Monto</p>
                  <p className="mt-1 text-3xl font-black text-amber-300">
                    {formatMXN(session.amount)}
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-xs text-neutral-300">
                  <ShieldCheck className="mt-0.5 shrink-0 text-cyan-400" size={16} />
                  Demo académica: no lee tarjetas, no usa Apple Pay real y no mueve dinero.
                </div>

                {statusView()}
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
