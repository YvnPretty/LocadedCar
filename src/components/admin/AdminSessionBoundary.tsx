"use client";
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import AdminAccessGate from './AdminAccessGate';
export default function AdminSessionBoundary({ children, expiresAt }: { children: React.ReactNode; expiresAt: string }) {
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('locaded-admin');
    if (channel) channel.onmessage = () => setLocked(true);
    async function verify() {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() >= Date.parse(expiresAt)) { setLocked(true); return; }
      try { const response = await fetch('/api/admin/session', { cache: 'no-store' }); if (!response.ok) setLocked(true); }
      catch { setLocked(true); }
    }
    const timer = setTimeout(() => setLocked(true), Math.max(0, Date.parse(expiresAt) - Date.now()));
    const poll = setInterval(verify, 30_000);
    document.addEventListener('visibilitychange', verify);
    window.addEventListener('pageshow', verify);
    return () => { clearTimeout(timer); clearInterval(poll); channel?.close(); document.removeEventListener('visibilitychange', verify); window.removeEventListener('pageshow', verify); };
  }, [expiresAt]);
  async function logout() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw new Error();
      if (typeof BroadcastChannel !== 'undefined') { const channel = new BroadcastChannel('locaded-admin'); channel.postMessage('logout'); channel.close(); }
      setLocked(true);
      window.location.replace('/admin');
    } catch { setError('No se pudo cerrar la sesión. Intenta de nuevo.'); setBusy(false); }
  }
  if (locked) return <AdminAccessGate/>;
  return <><div className="admin-session-bar"><span>Sesión de administrador · 30 minutos</span><button type="button" disabled={busy} onClick={logout}><LogOut size={15}/>{busy ? 'Cerrando…' : 'Cerrar sesión'}</button>{error && <p role="alert">{error}</p>}</div>{children}</>;
}
