"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessionState } from '@/hooks/useSessionState';
export default function WorkflowNavigation() {
  const pathname = usePathname();
  const [, setCatalogRoute] = useSessionState('navigation:/catalogo', '/catalogo');
  const [, setAdminRoute] = useSessionState('navigation:/admin', '/admin');
  const [checkoutId] = useSessionState('checkout:vehicle', '');
  const [checkoutStep] = useSessionState<1 | 2 | 3>('checkout:step', 1);
  const [posId] = useSessionState<string | null>('pos:vehicle', null);
  useEffect(() => {
    if (pathname === '/catalogo' || pathname.startsWith('/catalogo/')) setCatalogRoute(pathname);
    if (pathname === '/admin' || pathname.startsWith('/admin/')) setAdminRoute(pathname);
  }, [pathname, setCatalogRoute, setAdminRoute]);
  const staff = pathname.startsWith('/admin') || pathname.startsWith('/pos');
  const show = staff ? posId && !pathname.startsWith('/pos') : checkoutId && !pathname.startsWith('/checkout');
  if (!show) return null;
  const label = ['Datos del comprador', 'Método de pago', 'Revisión'][checkoutStep - 1] || 'Datos del comprador';
  return <aside aria-label="Operación en curso" className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-white p-4 text-sm text-ink shadow-xl">
    <div><p className="font-semibold">{staff ? 'Venta en preparación' : 'Compra en curso'}</p><p className="text-xs text-muted">{staff ? 'Conservamos tu captura' : `Paso ${checkoutStep} de 3 · ${label}`}</p></div>
    <Link className="rounded-lg bg-accent px-4 py-2 font-semibold text-black" href={staff ? '/pos' : '/checkout'}>Continuar</Link>
  </aside>;
}
