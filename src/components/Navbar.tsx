"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Route, ArrowUpRight, ChevronDown, ArrowRight } from "lucide-react";

type MenuId = "catalogo" | "nosotros";
const brands = ["Audi", "Porsche", "Mercedes-Benz", "Ferrari", "Lamborghini", "Bugatti", "Pagani", "Ford", "Chevrolet"];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<MenuId | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const header = useRef<HTMLElement | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const closeAll = () => { cancelClose(); setActive(null); setMobileOpen(false); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    const dismissOnPageScroll = () => {
      if (window.scrollY < 100) return;
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setActive(null);
      setMobileOpen(false);
    };
    window.addEventListener("scroll", dismissOnPageScroll, { passive: true });
    return () => window.removeEventListener("scroll", dismissOnPageScroll);
  }, []);

  const menus: { id: MenuId; label: string }[] = [
    { id: "catalogo", label: "Catálogo" }, { id: "nosotros", label: "Nosotros" },
  ];

  return <>
    <header ref={header} className="site-header" data-menu-open={active !== null}
      onPointerEnter={cancelClose}
      onPointerLeave={event => {
        if (event.pointerType !== "mouse" || !window.matchMedia('(min-width:1024px)').matches) return;
        cancelClose(); closeTimer.current = setTimeout(() => setActive(null), 180);
      }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeAll(); }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          const returnFocus = active ? trigger.current : header.current?.querySelector<HTMLButtonElement>('.mobile-toggle');
          closeAll(); returnFocus?.focus();
        }
      }}>
      <nav className="site-nav" aria-label="Navegación principal">
        <Link href="/" className="site-logo" onClick={closeAll}><Route size={32} className="site-logo-icon" />LOCADEDCAR</Link>
        <button type="button" className="mobile-toggle" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileOpen} aria-controls="site-links"
          onClick={() => { setMobileOpen(!mobileOpen); setActive(null); }}>{mobileOpen ? <X /> : <Menu />}</button>
        <div id="site-links" className={`site-links ${mobileOpen ? 'is-open' : ''}`}>
          {menus.map(({ id, label }) => <div className="nav-dropdown" key={id}>
            <button type="button" className="nav-trigger" aria-expanded={active === id} aria-controls={`nav-${id}`}
              data-current={pathname.startsWith(`/${id}`) || id === 'catalogo' && pathname === '/'}
              onPointerEnter={event => {
                cancelClose();
                if (event.pointerType === 'mouse' && window.matchMedia('(min-width:1024px)').matches) {
                  trigger.current = event.currentTarget; setActive(id);
                }
              }}
              onClick={event => { cancelClose(); trigger.current = event.currentTarget; setActive(active === id ? null : id); }}
              onKeyDown={event => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault(); cancelClose(); trigger.current = event.currentTarget; setActive(id);
                  requestAnimationFrame(() => header.current?.querySelector<HTMLAnchorElement>(`#nav-${id} a`)?.focus());
                }
              }}>{label}<ChevronDown size={14}/></button>
            <div id={`nav-${id}`} className="mega-panel" data-open={active === id} inert={active !== id} aria-hidden={active !== id}>
              <div className="mega-content">
                {id === 'catalogo' ? <>
                  <div className="mega-group mega-explore"><p className="mega-eyebrow">Encuentra tu siguiente deportivo</p>
                    <Link href="/catalogo?todos=1" onClick={closeAll}>Toda la colección <ArrowUpRight size={22}/></Link>
                    <Link href="/catalogo?tipo=deportivo" onClick={closeAll}>Deportivos</Link>
                    <Link href="/catalogo?tipo=semideportivo" onClick={closeAll}>Semideportivos</Link>
                  </div>
                  <div className="mega-group"><p className="mega-eyebrow">Explorar por marca</p><div className="mega-brands">
                    {brands.map(brand => <Link key={brand} href={`/catalogo?marca=${encodeURIComponent(brand)}`} onClick={closeAll}>{brand}<ArrowRight size={13}/></Link>)}
                  </div></div>
                  <div className="mega-group mega-feature"><Route size={26}/><p className="mega-eyebrow">Una elección a tu medida</p><h2>El siguiente paso<br/>empieza contigo.</h2><p>Explora modelos, colores y detalles. Te ayudamos a elegir.</p><Link href="/contacto" onClick={closeAll}>Hablar con un asesor <ArrowUpRight size={17}/></Link></div>
                </> : <>
                  <div className="mega-group mega-explore"><p className="mega-eyebrow">Conoce LocadedCar</p><Link href="/nosotros" onClick={closeAll}>Nuestra historia <ArrowUpRight size={22}/></Link><Link href="/contacto" onClick={closeAll}>Conversemos</Link></div>
                  <div className="mega-group"><p className="mega-eyebrow">Sigue explorando</p><Link href="/catalogo?todos=1" onClick={closeAll}>La colección completa</Link><Link href="/creditos-imagenes" onClick={closeAll}>Fotografías y créditos</Link></div>
                  <div className="mega-group mega-feature"><p className="mega-eyebrow">Pasión por conducir</p><h2>Conoce cada detalle.</h2><p>Fotografías, especificaciones y opciones de pintura en un mismo lugar.</p><Link href="/catalogo?todos=1" onClick={closeAll}>Explorar modelos <ArrowUpRight size={17}/></Link></div>
                </>}
              </div>
            </div>
          </div>)}
          {[["/contacto", "Contacto"], ["/pos", "POS"], ["/admin", "Admin"]].map(([href, label]) => <Link key={href} href={href} onClick={closeAll} onPointerEnter={event => { if (event.pointerType === 'mouse') { cancelClose(); setActive(null); } }} aria-current={pathname.startsWith(href) ? 'page' : undefined}>{label}</Link>)}
          <Link href="/checkout" className="nav-buy" onClick={closeAll}>Continuar compra <ArrowUpRight size={15}/></Link>
        </div>
      </nav>
    </header>
    <button type="button" className="nav-backdrop" data-open={active !== null || mobileOpen} tabIndex={-1} aria-hidden="true" onClick={closeAll}/>
  </>;
}
