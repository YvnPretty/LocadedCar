"use client";

import { FormEvent, useState } from "react";

export default function ContactoForm() {
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
        <label htmlFor="nombre" className="block text-sm text-white/50 mb-2">Nombre Completo</label>
        <input id="nombre" name="nombre" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Ej. Juan Pérez" />
      </div>
      <div>
        <label htmlFor="correo" className="block text-sm text-white/50 mb-2">Correo Electrónico</label>
        <input id="correo" name="correo" type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="juan@ejemplo.com" />
      </div>
      <div>
        <label htmlFor="telefono" className="block text-sm text-white/50 mb-2">Teléfono</label>
        <input id="telefono" name="telefono" type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Tu número de contacto" />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm text-white/50 mb-2">Mensaje o Auto de Interés</label>
        <textarea id="mensaje" name="mensaje" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Me interesa agendar una cita para..." />
      </div>
      {status === "success" && <p className="text-sm text-emerald-400">Solicitud recibida. Un asesor te contactará pronto.</p>}
      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="glass-button w-full py-4 rounded-xl text-white font-medium mt-4 disabled:opacity-50">
        {status === "sending" ? "Enviando..." : "Enviar Solicitud"}
      </button>
    </form>
  );
}