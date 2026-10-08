"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Route, ArrowUpRight } from "lucide-react";
const links = [["/catalogo", "Catálogo"], ["/nosotros", "Nosotros"], ["/contacto", "Contacto"], ["/pos", "POS"], ["/admin", "Admin"]];
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header"><nav className="site-nav" aria-label="Navegación principal">
    <Link href="/" className="site-logo" onClick={() => setOpen(false)}><Route size={32} className="site-logo-icon" />LOCADEDCAR</Link>
    <button type="button" className="mobile-toggle" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="site-links" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <div id="site-links" className={`site-links ${open ? 'is-open' : ''}`}>
      {links.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(href) || href === '/catalogo' && pathname === '/' ? 'page' : undefined}>{label}</Link>)}
      <Link href="/checkout" className="nav-buy" onClick={() => setOpen(false)}>Continuar compra <ArrowUpRight size={15} className="inline" /></Link>
    </div>
  </nav></header>;
}
