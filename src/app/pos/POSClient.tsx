"use client";

import { useSessionState, clearSessionDraft } from "@/hooks/useSessionState";
import ResumeLink from "@/components/ResumeLink";
import VehicleImage from "@/components/VehicleImage";
import { vehicleName } from "@/lib/vehicle-media";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CreditCard,
  Smartphone,
  Banknote,
  Send,
  Calendar,
  User,
  Plus,
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import SalesSummary from "./SalesSummary";
import { calculatePayment } from "@/lib/pos/payment";
import "./pos.css";
import POSTicketModal, { POSTicketData } from "@/components/POSTicketModal";

interface ColorVariante {
  id: string;
  nombre: string;
  hex: string;
  imagenUrl: string;
}

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  tipo: string;
  estado: string;
  imagenUrl: string | null;
  detalles: string | null;
  colores: ColorVariante[];
}

interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  rfc?: string | null;
  direccion?: string | null;
}

interface POSClientProps {
  initialCars: Vehiculo[];
  initialClients: Cliente[];
  defaultVendedor: { id: string; nombre: string };
}

export default function POSClient({
  initialCars,
  initialClients,
  defaultVendedor,
}: POSClientProps) {
  // State
  const [cars, setCars] = useState<Vehiculo[]>(initialCars);
  const [clients, setClients] = useState<Cliente[]>(initialClients);
  const [selectedCarId, setSelectedCarId] = useSessionState<string | null>("pos:vehicle", null);
  const selectedCar = cars.find(car => car.id === selectedCarId) ?? null;
  const setSelectedCar = (car: Vehiculo | null) => setSelectedCarId(car?.id ?? null);
  const [selectedColor, setSelectedColor] = useSessionState<ColorVariante | null>("pos:color", null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useSessionState("pos:search", "");
  const [categoryFilter, setCategoryFilter] = useSessionState<"ALL" | "deportivo" | "semideportivo" | "disponible">("pos:filter", "disponible");

  // Client Selection / Creation
  const [selectedClientId, setSelectedClientId] = useSessionState<string>("pos:client",
    "new"
  );
  const [clientForm, setClientForm] = useSessionState("pos:buyer", {
    nombre: "", correo: "", telefono: "", rfc: "", direccion: ""
  });
  const submitting = useRef(false);

  // Transaction Parameters
  const [modalidad, setModalidad] = useSessionState<"contado" | "apartado_10" | "personalizado">("pos:mode", "contado");
  const [metodoPago, setMetodoPago] = useSessionState<"tarjeta" | "contactless" | "spei" | "efectivo" | "financiamiento">("pos:method", "tarjeta");
  const [descuentoComercial, setDescuentoComercial] = useSessionState<number>("pos:discount", 0);
  const [montoPersonalizado, setMontoPersonalizado] = useSessionState<string>("pos:deposit", "");
  const [efectivoRecibido, setEfectivoRecibido] = useSessionState<string>("pos:cash", "");
  const [plazoMeses, setPlazoMeses] = useSessionState<number>("pos:months", 24);
  const [notasVenta, setNotasVenta] = useSessionState("pos:notes", "");

  // UI / Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<POSTicketData | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [showShiftDrawer, setShowShiftDrawer] = useState(false);
  const [time, setTime] = useState<string>("");
  const [contactlessSession, setContactlessSession] = useState<{
    id: string;
    paymentUrl: string;
    status: "pending" | "approved" | "declined" | "expired";
  } | null>(null);
  const contactlessPayload = useRef<Record<string, unknown> | null>(null);
  const contactlessCompleting = useRef(false);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Mexico_City" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Currency Formatter
  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  // Filtering
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesText =
        car.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.anio.toString().includes(searchQuery);

      if (!matchesText) return false;

      if (categoryFilter === "disponible") return car.estado === "disponible";
      if (categoryFilter === "deportivo") return car.tipo === "deportivo";
      if (categoryFilter === "semideportivo") return car.tipo === "semideportivo";
      return true;
    });
  }, [cars, searchQuery, categoryFilter]);

  // Computed Financial Totals
  const basePrice = selectedCar ? selectedCar.precio : 0;
  const precioConDescuento = Math.max(0, basePrice - descuentoComercial);

  const totalACobrar = useMemo(() => {
    if (modalidad === "apartado_10") {
      return Math.round(precioConDescuento * 10) / 100; // 10% de apartado
    }
    if (modalidad === "personalizado") {
      return Number(montoPersonalizado);
    }
    return precioConDescuento;
  }, [modalidad, precioConDescuento, montoPersonalizado]);

  const cambioEfectivo = useMemo(() => {
    const recibido = Number(efectivoRecibido) || 0;
    return recibido > totalACobrar ? recibido - totalACobrar : 0;
  }, [efectivoRecibido, totalACobrar]);

  // Handle Client Selection
  const handleSelectClient = (cId: string) => {
    setSelectedClientId(cId);
    if (cId === "new") {
      setClientForm({
        nombre: "",
        correo: "",
        telefono: "",
        rfc: "",
        direccion: ""
      });

    } else {
      const found = clients.find((c) => c.id === cId);
      if (found) {
        setClientForm({
          nombre: found.nombre,
          correo: found.correo,
          telefono: found.telefono || "",
          rfc: found.rfc || "",
          direccion: found.direccion || ""
        });
      }
    }
  };

  const finalizeSale = React.useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/pos/transaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Fallo en la comunicación con la terminal.");
    }

    clearSessionDraft("pos");
    setTicketData(data.data);
    setIsTicketOpen(true);

    setCars((prev) =>
      prev.map((car) =>
        car.id === data.data.vehiculo.id
          ? { ...car, estado: data.data.estadoUnidad }
          : car
      )
    );

    setClients((prev) =>
      prev.some((client) => client.correo === data.data.cliente.correo)
        ? prev
        : [data.data.cliente, ...prev]
    );
  }, [setTicketData, setIsTicketOpen, setCars, setClients]);

  // Submit Sale / Process POS
  const handleProcessSale = async () => {
    if (submitting.current) return;
    if (!selectedCar) {
      setErrorMsg("Seleccione un vehículo del catálogo.");
      return;
    }

    if (selectedCar.estado !== "disponible") {
      setErrorMsg("El vehículo seleccionado ya se encuentra vendido.");
      return;
    }

    if (!clientForm.nombre.trim()) {
      setErrorMsg("Por favor ingrese el nombre del comprador.");
      return;
    }

    if (metodoPago === "efectivo" && (Number(efectivoRecibido) || 0) < totalACobrar) {
      setErrorMsg("El efectivo recibido es menor al total a cobrar.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.correo.trim())) {
      setErrorMsg("Ingrese un correo electrónico válido."); return;
    }
    try { calculatePayment(selectedCar.precio, modalidad, descuentoComercial, Number(montoPersonalizado)); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "Revise los importes."); return; }
    setErrorMsg(null);
    submitting.current = true;
    setLoading(true);

    try {
      const payload = {
        vehiculoId: selectedCar.id,
        colorVarianteId: selectedColor?.id || null,
        cliente: {
          nombre: clientForm.nombre,
          correo: clientForm.correo,
          telefono: clientForm.telefono,
          rfc: clientForm.rfc,
          direccion: clientForm.direccion
        },
        modalidad,
        metodoPago,
        montoTotal: totalACobrar,
        montoRecibido: metodoPago === "efectivo" ? Number(efectivoRecibido) : totalACobrar,
        cambio: cambioEfectivo,
        descuento: descuentoComercial,
        plazoMeses: metodoPago === "financiamiento" ? plazoMeses : null,
        notasVenta,
        vendedorNombre: defaultVendedor.nombre
      };

      if (metodoPago === "contactless") {
        const sessionResponse = await fetch("/api/payments/contactless", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalACobrar,
            vehicleId: selectedCar.id,
            vehicle: `${selectedCar.marca} ${selectedCar.modelo} (${selectedCar.anio})`
          })
        });

        const sessionData = await sessionResponse.json();
        if (!sessionResponse.ok) {
          throw new Error(sessionData.error || "No fue posible iniciar Tap to Pay demo.");
        }

        contactlessPayload.current = { ...payload, contactlessSessionId: sessionData.data.id };
        contactlessCompleting.current = false;
        setContactlessSession(sessionData.data);
        return;
      }

      await finalizeSale(payload);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar la venta.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionId = contactlessSession?.id;
    if (!sessionId || contactlessSession.status !== "pending") return;

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/contactless/${sessionId}`, {
          cache: "no-store"
        });
        const data = await response.json();
        if (cancelled) return;
        if (response.status === 404) {
          contactlessPayload.current = null;
          setContactlessSession(null);
          setErrorMsg("La sesión Tap iPhone ya no está disponible. Genere una nueva sesión.");
          return;
        }
        if (!response.ok) return;

        const status = data.data.status as "pending" | "approved" | "declined" | "expired";

        if (status === "approved" && !contactlessCompleting.current) {
          const payload = contactlessPayload.current;
          if (!payload) {
            setErrorMsg("La sesión fue aprobada, pero no se encontró la venta pendiente.");
            setContactlessSession(null);
            return;
          }

          contactlessCompleting.current = true;
          submitting.current = true;
          setLoading(true);

          try {
            await finalizeSale(payload);
            contactlessPayload.current = null;
            setContactlessSession(null);
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "El pago fue aprobado, pero no se pudo registrar la venta.");
            setContactlessSession((prev) => prev ? { ...prev, status: "approved" } : prev);
          } finally {
            submitting.current = false;
            setLoading(false);
          }
          return;
        }

        if (status === "declined" || status === "expired") {
          contactlessPayload.current = null;
          setContactlessSession(null);
          setErrorMsg(status === "declined"
            ? "El pago sin contacto fue rechazado desde el iPhone."
            : "La sesión Tap to Pay expiró. Genere una nueva sesión.");
        }
      } catch {
        // A transient polling error should not cancel the simulated payment session.
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 1200);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [contactlessSession?.id, contactlessSession?.status, finalizeSale]);

  return (
    <div className="pos-screen min-h-screen bg-white text-ink flex flex-col font-sans selection:bg-accent selection:text-black">
      {/* 1. TOP HUD TELEMETRY BAR */}
      <header className="sticky top-0 z-40 bg-white backdrop-blur-xl border-b border-line px-4 md:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent flex items-center justify-center text-black font-black text-xs shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              LC
            </div>
            <span className="font-extrabold tracking-tight text-sm text-ink">
              LOCADED<span className="text-brand font-light">POS</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-line text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-brand border border-emerald-500/20 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ESTACIÓN ACTIVA: POS-01
            </span>
            <span className="text-muted">•</span>
            <span className="text-muted">REGISTRO DE OPERACIONES</span>
          </div>
        </div>

        {/* Center Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-xs font-mono text-muted">
          <Clock size={13} className="text-brand" />
          <span>{time || "12:00:00"}</span>
          <span className="text-muted">CDMX</span>
        </div>

        {/* Right Section: Cashier and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface border border-line text-xs">
            <div className="w-6 h-6 rounded-full bg-accent/20 text-brand flex items-center justify-center font-bold text-[10px]">
              VIP
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-[11px] text-ink leading-tight">{defaultVendedor.nombre}</p>
              <p className="text-[9px] text-muted font-mono">Asesor Concierge</p>
            </div>
          </div>

          <button
            onClick={() => setShowShiftDrawer(!showShiftDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-brand border border-accent/30 text-xs font-medium transition-all"
          >
            <TrendingUp size={14} />
            <span className="hidden sm:inline">Historial</span>
          </button>

          <ResumeLink
            href="/admin"
            className="p-1.5 rounded-xl bg-surface hover:bg-surface border border-line text-muted hover:text-ink transition-colors"
            title="Continuar en administración"
          >
            <SlidersHorizontal size={16} />
          </ResumeLink>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 text-sm">
        <p className="text-muted">{selectedCar ? `Venta en preparación · ${vehicleName(selectedCar)}` : "Selecciona un vehículo para iniciar una venta"}</p>
        <button type="button" disabled={loading || contactlessSession?.status === "pending"} className="text-brand underline disabled:opacity-40" onClick={() => { if (window.confirm("¿Descartar la captura actual?")) clearSessionDraft("pos"); }}>Nueva venta</button>
      </div>
      {/* 2. MAIN DUAL-PANE COCKPIT */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        
        {/* === LEFT PANE: SHOWROOM & VEHICLE SELECTOR (7 Cols) === */}
        <div className="xl:col-span-7 flex flex-col border-r border-line bg-white backdrop-blur-md overflow-hidden">
          
          {/* Search & Category Filter Controls */}
          <div className="p-4 border-b border-line space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar por marca, modelo, año (ej. Porsche, R8, 2024)..." placeholder="Buscar por marca, modelo, año (ej. Porsche, R8, 2024)..."
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-line rounded-xl text-xs text-ink placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                />
              </div>

              <span className="text-xs font-mono text-muted bg-surface px-2.5 py-2 rounded-xl border border-line">
                {filteredCars.length} resultados
              </span>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setCategoryFilter("disponible")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "disponible"
                    ? "bg-emerald-500/20 text-brand border border-emerald-500/40"
                    : "bg-surface text-muted hover:text-ink border border-line"
                }`}
              >
                ✓ Solo Disponibles
              </button>
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "ALL"
                    ? "bg-accent/20 text-brand border border-accent/40"
                    : "bg-surface text-muted hover:text-ink border border-line"
                }`}
              >
                Todos los Vehículos
              </button>
              <button
                onClick={() => setCategoryFilter("deportivo")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "deportivo"
                    ? "bg-accent/20 text-brand border border-accent/40"
                    : "bg-surface text-muted hover:text-ink border border-line"
                }`}
              >
                🏎️ Deportivos
              </button>
              <button
                onClick={() => setCategoryFilter("semideportivo")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "semideportivo"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "bg-surface text-muted hover:text-ink border border-line"
                }`}
              >
                GT / Semideportivos
              </button>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[55dvh] xl:max-h-[calc(100dvh-140px)] space-y-3">
            {filteredCars.length === 0 && <p role="status" className="p-8 text-center text-muted">No hay vehículos que coincidan. Pruebe otra búsqueda o filtro.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCars.map((car) => {
                const isSelected = selectedCar?.id === car.id;
                const isAvailable = car.estado === "disponible";

                return (
                  <motion.div
                    key={car.id}
                    layoutId={`car-card-${car.id}`}
                    role="button" tabIndex={0} aria-label={`Seleccionar ${vehicleName(car)}`} aria-pressed={isSelected}
                    onKeyDown={e => { if (e.target !== e.currentTarget || loading) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedCar(car); setSelectedColor(car.colores[0] ?? null); } }}
                    onClick={() => {
                      if (loading) return;
                      setSelectedCar(car);
                      setSelectedColor(car.colores[0] ?? null);
                    }}
                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-accent to-transparent border-accent/60 shadow-xl shadow-accent/10"
                        : "bg-surface hover:bg-surface border-line"
                    }`}
                  >
                    {/* Status & Category Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted px-2 py-0.5 rounded bg-surface border border-line">
                        {car.tipo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isAvailable
                            ? "bg-emerald-500/20 text-brand border border-emerald-500/30"
                            : "bg-red-500/20 text-red-700 border border-red-500/30"
                        }`}
                      >
                        {car.estado}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface mb-3 border border-line">
                      <VehicleImage car={car} src={isSelected ? selectedColor?.imagenUrl : undefined} className="w-full h-full  group-hover:scale-105 transition-transform duration-500" showCredit />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                      
                      {/* Brand and Model Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-brand tracking-wider uppercase">
                            {car.marca}
                          </p>
                          <h4 className="text-sm font-bold text-ink leading-tight">
                            {vehicleName(car)} ({car.anio})
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Color variants selector inside card if available */}
                    {car.colores && car.colores.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="text-[10px] text-muted">Variantes:</span>
                        <div className="flex items-center gap-1">
                          {car.colores.map((c) => (
                            <button
                              key={c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (loading) return;
                      setSelectedCar(car);
                                setSelectedColor(c);
                              }}
                              aria-label={`Color ${c.nombre}`} aria-pressed={isSelected && selectedColor?.id === c.id}
                              className={`w-10 h-10 rounded-full border transition-all ${
                                isSelected && selectedColor?.id === c.id
                                  ? "border-accent scale-125 ring-2 ring-accent/30"
                                  : "border-line hover:scale-110"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.nombre}
                            ></button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Price & Action */}
                    <div className="pt-2 border-t border-line flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted block leading-none">Precio Contado</span>
                        <span className="text-sm font-black text-brand font-mono">
                          {formatMXN(car.precio)}
                        </span>
                      </div>

                      <button
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-accent text-black shadow-lg shadow-accent/20"
                            : "bg-surface text-ink hover:bg-surface"
                        }`}
                      >
                        {isSelected ? "Seleccionado" : "Cargar"}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT PANE: COCKPIT DE DESPACHO & COBRO (5 Cols) === */}
        <div className="xl:col-span-5 flex flex-col bg-white overflow-y-auto xl:max-h-[calc(100dvh-50px)] p-4 md:p-6 space-y-4">
          
          {/* Active Unit Header Card */}
          {selectedCar ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-line relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-brand bg-accent/10 px-2 py-0.5 rounded border border-accent/20 uppercase font-bold">
                      {selectedCar.marca}
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      ID de unidad: {selectedCar.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-ink">{vehicleName(selectedCar)}</h2>
                  <p className="text-xs text-muted line-clamp-1">{selectedCar.detalles || "Unidad de Alto Rendimiento."}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-muted">Precio Base</span>
                  <p className="text-lg font-black text-brand font-mono">
                    {formatMXN(selectedCar.precio)}
                  </p>
                </div>
              </div>

              {/* Color variant picked */}
              {selectedColor && (
                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-line"
                      style={{ backgroundColor: selectedColor.hex }}
                    ></span>
                    Configuración: <strong className="text-ink">{selectedColor.nombre}</strong>
                  </span>
                  <span className="text-[11px] text-brand font-mono font-medium">Fotomappeo Listo</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted border border-dashed border-line rounded-2xl">
              Seleccione un auto en el catálogo izquierdo para comenzar el cobro.
            </div>
          )}

          {/* 1. SELECTOR DE COMPRADOR VIP */}
          <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-brand" />
                Comprador VIP
              </label>

              <button
                type="button"
                onClick={() => handleSelectClient("new")}
                className="text-[11px] text-brand hover:text-brand flex items-center gap-1 font-semibold transition"
              >
                <Plus size={13} /> Alta Rápida
              </button>
            </div>

            <div className="space-y-2">
              <select
                aria-label="Seleccionar comprador"
                value={selectedClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
              >
                <option value="new" className="bg-white text-ink">
                  👤 Nuevo comprador
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-ink">
                    {c.nombre} ({c.correo})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  aria-label="Nombre completo" placeholder="Nombre completo"
                  value={clientForm.nombre}
                  onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface border border-line rounded-lg text-ink placeholder-muted outline-none focus:border-accent"
                />
                <input
                  type="text"
                  aria-label="RFC / Tax ID" placeholder="RFC / Tax ID"
                  value={clientForm.rfc}
                  onChange={(e) => setClientForm({ ...clientForm, rfc: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface border border-line rounded-lg text-ink placeholder-muted outline-none focus:border-accent"
                />
                <input
                  type="email"
                  aria-label="Correo electrónico" placeholder="Correo electrónico"
                  value={clientForm.correo}
                  onChange={(e) => setClientForm({ ...clientForm, correo: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface border border-line rounded-lg text-ink placeholder-muted outline-none focus:border-accent"
                />
                <input
                  type="text"
                  aria-label="Teléfono" placeholder="Teléfono"
                  value={clientForm.telefono}
                  onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface border border-line rounded-lg text-ink placeholder-muted outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* 2. MODALIDAD DE PAGO */}
          <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
            <label className="text-xs font-bold text-muted uppercase tracking-wider block">
              Modalidad de Venta
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalidad("contado")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "contado"
                    ? "bg-accent/20 border-accent text-brand shadow-md shadow-accent/10"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                Liquidación Total
                <span className="block text-[10px] font-normal text-muted mt-0.5">100% Contado</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidad("apartado_10")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "apartado_10"
                    ? "bg-emerald-500/20 border-emerald-400 text-brand shadow-md shadow-emerald-500/10"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                Apartado VIP
                <span className="block text-[10px] font-normal text-muted mt-0.5">10% Anticipo</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidad("personalizado")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "personalizado"
                    ? "bg-accent/20 border-accent text-brand shadow-md shadow-accent/10"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                Enganche Libre
                <span className="block text-[10px] font-normal text-muted mt-0.5">Monto Manual</span>
              </button>
            </div>

            {modalidad === "personalizado" && (
              <div className="pt-2">
                <input
                  type="number"
                  aria-label="Ingrese el monto del anticipo (MXN)" placeholder="Ingrese el monto del anticipo (MXN)"
                  value={montoPersonalizado}
                  onChange={(e) => setMontoPersonalizado(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink outline-none focus:border-accent font-mono"
                />
              </div>
            )}
          </div>

          {/* 3. MÉTODO DE COBRO MULTIMODAL */}
          <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
            <label className="text-xs font-bold text-muted uppercase tracking-wider block">
              Método de Cobro en Terminal
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                type="button"
                disabled={contactlessSession?.status === "pending"}
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  metodoPago === "tarjeta"
                    ? "bg-accent/20 border-accent text-brand"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <CreditCard size={18} />
                <span className="text-[11px] font-medium">TPV Card</span>
              </button>

              <button
                type="button"
                disabled={contactlessSession?.status === "pending"}
                onClick={() => setMetodoPago("contactless")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  metodoPago === "contactless"
                    ? "bg-accent/20 border-accent text-brand"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <Smartphone size={18} />
                <span className="text-[11px] font-medium">Tap iPhone</span>
              </button>

              <button
                type="button"
                disabled={contactlessSession?.status === "pending"}
                onClick={() => setMetodoPago("spei")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  metodoPago === "spei"
                    ? "bg-accent/20 border-accent text-brand"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <Send size={18} />
                <span className="text-[11px] font-medium">SPEI STP</span>
              </button>

              <button
                type="button"
                disabled={contactlessSession?.status === "pending"}
                onClick={() => setMetodoPago("efectivo")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  metodoPago === "efectivo"
                    ? "bg-emerald-500/20 border-emerald-400 text-brand"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <Banknote size={18} />
                <span className="text-[11px] font-medium">Efectivo</span>
              </button>

              <button
                type="button"
                disabled={contactlessSession?.status === "pending"}
                onClick={() => setMetodoPago("financiamiento")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  metodoPago === "financiamiento"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <Calendar size={18} />
                <span className="text-[11px] font-medium">Crédito</span>
              </button>
            </div>

            {metodoPago === "contactless" && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-brand" />
                  <span className="font-bold text-brand">Tap to Pay · modo simulación</span>
                </div>

                {contactlessSession ? (
                  <>
                    <div className="rounded-lg border border-line bg-surface p-2.5">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brand">
                        {contactlessSession.status === "approved" ? "PAGO APROBADO · VENTA NO REGISTRADA" : "SESIÓN PENDIENTE · ESPERANDO IPHONE"}
                      </p>
                      <p className="mt-1 break-all text-[11px] text-muted">
                        {contactlessSession.paymentUrl}
                      </p>
                    </div>
                    <a
                      href={contactlessSession.paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 px-3 py-2 font-bold text-brand hover:bg-accent/25"
                    >
                      Abrir simulador de pago
                    </a>
                    <p className="text-[10px] leading-relaxed text-muted">
                      Abra esa dirección en el iPhone. Al tocar “Aprobar pago”, el POS detectará la confirmación y emitirá el recibo automáticamente.
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] leading-relaxed text-muted">
                    Al registrar la venta se generará una sesión temporal. No se procesa dinero ni se leen tarjetas reales.
                  </p>
                )}
              </div>
            )}

            {/* Sub-interfaces depending on payment method */}
            {metodoPago === "efectivo" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-muted">
                  <span>Monto Exacto a Cubrir:</span>
                  <span className="font-mono font-bold text-ink">{formatMXN(totalACobrar)}</span>
                </div>

                <div>
                  <label className="text-[11px] text-muted block mb-1">Efectivo Entregado por Cliente:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      aria-label="0.00" placeholder="0.00"
                      value={efectivoRecibido}
                      onChange={(e) => setEfectivoRecibido(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface border border-emerald-500/40 rounded-lg text-ink font-mono outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setEfectivoRecibido(totalACobrar.toString())}
                      className="px-3 py-1 rounded-lg bg-emerald-600/30 text-brand hover:bg-emerald-600/40 border border-emerald-500/30 text-[11px] font-bold"
                    >
                      Exacto
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center">
                  <span className="font-bold text-muted">Cambio / Vuelto a Devolver:</span>
                  <span className="font-mono text-sm font-black text-brand">
                    {formatMXN(cambioEfectivo)}
                  </span>
                </div>
              </div>
            )}

            {metodoPago === "spei" && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">CLABE STP Institucional:</span>
                  <span className="font-mono text-brand font-bold">646180157000002026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Beneficiario:</span>
                  <span className="font-bold text-ink">LOCADEDCAR MOTORS SA DE CV</span>
                </div>
                <p className="text-[10px] text-muted">
                  La transacción se validará con acuse CEP en el folio de venta.
                </p>
              </div>
            )}

            {metodoPago === "financiamiento" && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Plazo Seleccionado:</span>
                  <span className="font-bold text-purple-300">{plazoMeses} Mensualidades</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[12, 24, 36, 48].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPlazoMeses(m)}
                      className={`py-1 rounded-lg border text-center font-bold transition-all ${
                        plazoMeses === m
                          ? "bg-purple-500 text-ink border-purple-400"
                          : "bg-surface text-muted border-line"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center">
                  <span className="text-muted">Cuota Mensual Proyectada:</span>
                  <span className="font-mono font-bold text-purple-300">
                    {formatMXN(totalACobrar / plazoMeses)} / mes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. FINANCIAL SUMMARY & EXECUTION BUTTON */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-accent via-white/90 to-white/[0.02] border border-accent/30 space-y-3 shadow-2xl">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal (Base):</span>
                <span>{formatMXN(totalACobrar / 1.16)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>IVA Trasladado (16%):</span>
                <span>{formatMXN(totalACobrar - totalACobrar / 1.16)}</span>
              </div>
              <div className="pt-2 border-t border-line flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold tracking-wider text-brand">
                  Total a Procesar:
                </span>
                <span className="text-2xl font-black text-brand font-mono tracking-tight">
                  {formatMXN(totalACobrar)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-700 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleProcessSale}
              disabled={loading || !selectedCar || selectedCar.estado !== "disponible" || (metodoPago === "contactless" && contactlessSession?.status === "pending")}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-accent via-accent to-accent hover:from-accent hover:to-accent text-black shadow-lg shadow-accent/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                  Registrando operación…
                </>
              ) : metodoPago === "contactless" && contactlessSession?.status === "pending" ? (
                <>
                  <Smartphone size={18} />
                  Esperando confirmación en iPhone…
                </>
              ) : selectedCar && selectedCar.estado !== "disponible" ? (
                "Unidad Vendida / No Disponible"
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Registrar venta y emitir recibo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE TICKET FISCAL Y RECIBO IMPRIMIBLE */}
      <POSTicketModal
        isOpen={isTicketOpen}
        onClose={() => {
          setIsTicketOpen(false); setSelectedCar(null); setSelectedColor(null);
          setSelectedClientId("new"); setClientForm({ nombre: "", correo: "", telefono: "", rfc: "", direccion: "" });
          setEfectivoRecibido(""); setMontoPersonalizado(""); setDescuentoComercial(0); setNotasVenta(""); setModalidad("contado");
        }}
        ticket={ticketData}
      />

      {/* 4. CORTE DE CAJA / HISTORIAL DEL TURNO (DRAWER LATERAL) */}
      <AnimatePresence>
        {showShiftDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-md bg-white border-l border-line h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand" />
                    <h3 className="font-bold text-ink text-base">Historial de operaciones</h3>
                  </div>
                  <button
                    onClick={() => setShowShiftDrawer(false)}
                    className="p-1 rounded-full text-muted hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                </div>

                <SalesSummary />
              </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
