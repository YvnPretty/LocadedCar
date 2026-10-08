"use client";

import { useSessionState } from "@/hooks/useSessionState";
import { FormEvent, useState } from "react";

export default function ContactoForm() {
  const [draft, setDraft] = useSessionState("contact:form", { nombre: "", correo: "", telefono: "", mensaje: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setDraft({ nombre: "", correo: "", telefono: "", mensaje: "" });
      form.reset();
      setStatus("success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo enviar la solicitud.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="nombre" className="block text-sm text-muted mb-2">Nombre Completo</label>
        <input id="nombre" name="nombre" value={draft.nombre} onChange={e => setDraft({ ...draft, nombre: e.target.value })} required className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-line transition-colors" placeholder="Ej. Juan Pérez" />
      </div>
      <div>
        <label htmlFor="correo" className="block text-sm text-muted mb-2">Correo Electrónico</label>
        <input id="correo" name="correo" value={draft.correo} onChange={e => setDraft({ ...draft, correo: e.target.value })} type="email" required className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-line transition-colors" placeholder="juan@ejemplo.com" />
      </div>
      <div>
        <label htmlFor="telefono" className="block text-sm text-muted mb-2">Teléfono</label>
        <input id="telefono" name="telefono" value={draft.telefono} onChange={e => setDraft({ ...draft, telefono: e.target.value })} type="tel" className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-line transition-colors" placeholder="Tu número de contacto" />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm text-muted mb-2">Mensaje o Auto de Interés</label>
        <textarea id="mensaje" name="mensaje" value={draft.mensaje} onChange={e => setDraft({ ...draft, mensaje: e.target.value })} required rows={4} className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-line transition-colors" placeholder="Me interesa agendar una cita para..." />
      </div>
      {status === "success" && <p className="text-sm text-brand">Solicitud recibida. Un asesor te contactará pronto.</p>}
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="glass-button w-full py-4 rounded-xl text-ink font-medium mt-4 disabled:opacity-50">
        {status === "sending" ? "Enviando..." : "Enviar Solicitud"}
      </button>
    </form>
  );
}