"use client";
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react';
export default function AdminAccessGate() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: fields.get('username'), password: fields.get('password') }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? 'No se pudo iniciar sesión.'); setBusy(false); return; }
      form.reset();
      // Replace the full document so no cached administrative view survives an auth change.
      window.location.replace(window.location.pathname);
    } catch { setError('No se pudo conectar. Intenta de nuevo.'); setBusy(false); }
  }
  return <main className="admin-locked">
    <div className="admin-locked-preview" aria-hidden="true" inert>
      <aside><div className="admin-skeleton title"/>{Array.from({length:5},(_,i)=><div key={i} className="admin-skeleton nav"/>)}</aside>
      <div><div className="admin-skeleton title"/><div className="admin-preview-cards">{[0,1,2].map(i=><div key={i}><div className="admin-skeleton"/><div className="admin-skeleton title"/></div>)}</div><div className="admin-preview-table">{[0,1,2,3,4].map(i=><div key={i} className="admin-skeleton"/>)}</div></div>
    </div>
    <section className="admin-access-card" aria-labelledby="admin-access-title">
      <div className="admin-lock-icon"><LockKeyhole size={26}/></div>
      <p className="eyebrow">Acceso exclusivo</p>
      <h1 id="admin-access-title">Solo administración</h1>
      <p className="admin-access-description">Ingresa tus credenciales para consultar y administrar el negocio.</p>
      <form onSubmit={submit}>
        <label htmlFor="admin-username">Usuario<input id="admin-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={100} required disabled={busy}/></label>
        <label htmlFor="admin-password">Contraseña<input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={256} required disabled={busy}/></label>
        {error && <p role="alert" className="admin-login-error">{error}</p>}
        <button type="submit" className="vehicle-primary-action" disabled={busy}>{busy ? 'Verificando…' : 'Entrar a administración'}{!busy && <ArrowRight size={17}/>}</button>
      </form>
      <Link href="/pos" className="admin-return">Volver al punto de venta</Link>
      <p className="admin-access-footnote"><ShieldCheck size={14}/> Los datos están protegidos.</p>
    </section>
  </main>;
}
