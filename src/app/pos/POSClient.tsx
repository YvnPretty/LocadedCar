"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Car,
  CreditCard,
  Banknote,
  Send,
  Calendar,
  Check,
  User,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock,
  TrendingUp,
  Receipt,
  ChevronRight,
  SlidersHorizontal,
  X,
  Building2,
  DollarSign,
  Fuel,
  Gauge
} from "lucide-react";
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
  const [selectedCar, setSelectedCar] = useState<Vehiculo | null>(
    initialCars.find((c) => c.estado === "disponible") || initialCars[0] || null
  );
  const [selectedColor, setSelectedColor] = useState<ColorVariante | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "deportivo" | "semideportivo" | "disponible">("disponible");

  // Client Selection / Creation
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClients[0]?.id || "new"
  );
  const [clientForm, setClientForm] = useState({
    nombre: "Gabriel Domínguez Amacende",
    correo: "gabriel.dominguez@itma2.edu.mx",
    telefono: "55 8921 4400",
    rfc: "DOAG880914-VIP",
    direccion: "Av. Paseo de la Reforma 222, CDMX"
  });
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Transaction Parameters
  const [modalidad, setModalidad] = useState<"contado" | "apartado_10" | "personalizado">("contado");
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "spei" | "efectivo" | "financiamiento">("tarjeta");
  const [descuentoComercial, setDescuentoComercial] = useState<number>(0);
  const [montoPersonalizado, setMontoPersonalizado] = useState<string>("");
  const [efectivoRecibido, setEfectivoRecibido] = useState<string>("");
  const [plazoMeses, setPlazoMeses] = useState<number>(24);
  const [notasVenta, setNotasVenta] = useState("");

  // UI / Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<POSTicketData | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [showShiftDrawer, setShowShiftDrawer] = useState(false);
  const [time, setTime] = useState<string>("");

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update selected color variant when car changes
  useEffect(() => {
    if (selectedCar && selectedCar.colores && selectedCar.colores.length > 0) {
      setSelectedColor(selectedCar.colores[0]);
    } else {
      setSelectedColor(null);
    }
  }, [selectedCar]);

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
      return precioConDescuento * 0.10; // 10% de apartado
    }
    if (modalidad === "personalizado" && Number(montoPersonalizado) > 0) {
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
      setShowNewClientModal(true);
    } else {
      const found = clients.find((c) => c.id === cId);
      if (found) {
        setClientForm({
          nombre: found.nombre,
          correo: found.correo,
          telefono: found.telefono || "",
          rfc: "XAXX010101000",
          direccion: "Dirección Registrada en Concesionaria"
        });
      }
    }
  };

  // Submit Sale / Process POS
  const handleProcessSale = async () => {
    if (!selectedCar) {
      setErrorMsg("Seleccione un vehículo del catálogo.");
      return;
    }

    if (selectedCar.estado === "vendido") {
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

    setErrorMsg(null);
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

      const res = await fetch("/api/pos/transaccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fallo en la comunicación con la terminal.");
      }

      // Update state locally
      setTicketData(data.data);
      setIsTicketOpen(true);

      // Update cars list to reflect sold/apartado status
      setCars((prev) =>
        prev.map((c) =>
          c.id === selectedCar.id
            ? { ...c, estado: data.data.estadoUnidad }
            : c
        )
      );

      // Add client to local cache if newly created
      if (!clients.some((c) => c.correo === data.data.cliente.correo)) {
        setClients((prev) => [data.data.cliente, ...prev]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la venta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. TOP HUD TELEMETRY BAR */}
      <header className="sticky top-0 z-40 bg-[#0b0d11]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              LC
            </div>
            <span className="font-extrabold tracking-tight text-sm text-white">
              LOCADED<span className="text-amber-400 font-light">POS</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ESTACIÓN ACTIVA: POS-01
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">ENCRIPTACIÓN SHA-256</span>
          </div>
        </div>

        {/* Center Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
          <Clock size={13} className="text-cyan-400" />
          <span>{time || "12:00:00"}</span>
          <span className="text-neutral-500">CDMX</span>
        </div>

        {/* Right Section: Cashier and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
              VIP
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-[11px] text-white leading-tight">{defaultVendedor.nombre}</p>
              <p className="text-[9px] text-neutral-400 font-mono">Asesor Concierge</p>
            </div>
          </div>

          <button
            onClick={() => setShowShiftDrawer(!showShiftDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-all"
          >
            <TrendingUp size={14} />
            <span className="hidden sm:inline">Corte / Turno</span>
          </button>

          <Link
            href="/admin/inventario"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Ir al Inventario Admin"
          >
            <SlidersHorizontal size={16} />
          </Link>
        </div>
      </header>

      {/* 2. MAIN DUAL-PANE COCKPIT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* === LEFT PANE: SHOWROOM & VEHICLE SELECTOR (7 Cols) === */}
        <div className="lg:col-span-7 flex flex-col border-r border-white/10 bg-[#080a0d]/60 backdrop-blur-md overflow-hidden">
          
          {/* Search & Category Filter Controls */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por marca, modelo, año (ej. Porsche, R8, 2024)..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                />
              </div>

              <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-2 rounded-xl border border-white/10">
                {filteredCars.length} Disp.
              </span>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setCategoryFilter("disponible")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "disponible"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                }`}
              >
                ✓ Solo Disponibles
              </button>
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "ALL"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                }`}
              >
                Todos los Vehículos
              </button>
              <button
                onClick={() => setCategoryFilter("deportivo")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "deportivo"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                }`}
              >
                🏎️ Deportivos
              </button>
              <button
                onClick={() => setCategoryFilter("semideportivo")}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === "semideportivo"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                }`}
              >
                GT / Semideportivos
              </button>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-140px)] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCars.map((car) => {
                const isSelected = selectedCar?.id === car.id;
                const isAvailable = car.estado === "disponible";

                return (
                  <motion.div
                    key={car.id}
                    layoutId={`car-card-${car.id}`}
                    onClick={() => {
                      setSelectedCar(car);
                    }}
                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-amber-500/15 to-transparent border-amber-500/60 shadow-xl shadow-amber-500/10"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                    }`}
                  >
                    {/* Status & Category Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {car.tipo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isAvailable
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {car.estado}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/5">
                      <img
                        src={car.imagenUrl || "/renders/audi_r8_red.jpg"}
                        alt={car.modelo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Brand and Model Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                            {car.marca}
                          </p>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {car.modelo} ({car.anio})
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Color variants selector inside card if available */}
                    {car.colores && car.colores.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="text-[10px] text-neutral-400">Variantes:</span>
                        <div className="flex items-center gap-1">
                          {car.colores.map((c) => (
                            <button
                              key={c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCar(car);
                                setSelectedColor(c);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                isSelected && selectedColor?.id === c.id
                                  ? "border-amber-400 scale-125 ring-2 ring-amber-400/30"
                                  : "border-white/30 hover:scale-110"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.nombre}
                            ></button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Price & Action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 block leading-none">Precio Contado</span>
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {formatMXN(car.precio)}
                        </span>
                      </div>

                      <button
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                            : "bg-white/10 text-white hover:bg-white/20"
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
        <div className="lg:col-span-5 flex flex-col bg-[#0b0e13] overflow-y-auto max-h-[calc(100vh-50px)] p-4 md:p-6 space-y-4">
          
          {/* Active Unit Header Card */}
          {selectedCar ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-bold">
                      {selectedCar.marca}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      VIN-LOC-{selectedCar.anio}-{selectedCar.id.slice(0, 5).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">{selectedCar.modelo}</h2>
                  <p className="text-xs text-neutral-400 line-clamp-1">{selectedCar.detalles || "Unidad de Alto Rendimiento."}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-neutral-400">Precio Base</span>
                  <p className="text-lg font-black text-amber-400 font-mono">
                    {formatMXN(selectedCar.precio)}
                  </p>
                </div>
              </div>

              {/* Color variant picked */}
              {selectedColor && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: selectedColor.hex }}
                    ></span>
                    Configuración: <strong className="text-white">{selectedColor.nombre}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">Fotomappeo Listo</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-2xl">
              Seleccione un auto en el catálogo izquierdo para comenzar el cobro.
            </div>
          )}

          {/* 1. SELECTOR DE COMPRADOR VIP */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-cyan-400" />
                Comprador VIP
              </label>

              <button
                type="button"
                onClick={() => handleSelectClient("new")}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition"
              >
                <Plus size={13} /> Alta Rápida
              </button>
            </div>

            <div className="space-y-2">
              <select
                value={selectedClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
              >
                <option value="custom" className="bg-neutral-900 text-white">
                  👤 Comprador en Mostrador (Personalizado)
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                    {c.nombre} ({c.correo})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={clientForm.nombre}
                  onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="RFC / Tax ID"
                  value={clientForm.rfc}
                  onChange={(e) => setClientForm({ ...clientForm, rfc: e.target.value })}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-cyan-400"
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={clientForm.correo}
                  onChange={(e) => setClientForm({ ...clientForm, correo: e.target.value })}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={clientForm.telefono}
                  onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 2. MODALIDAD DE PAGO */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Modalidad de Venta
            </label>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalidad("contado")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "contado"
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                Liquidación Total
                <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">100% Contado</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidad("apartado_10")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "apartado_10"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                Apartado VIP
                <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">10% Anticipo</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidad("personalizado")}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  modalidad === "personalizado"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                Enganche Libre
                <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">Monto Manual</span>
              </button>
            </div>

            {modalidad === "personalizado" && (
              <div className="pt-2">
                <input
                  type="number"
                  placeholder="Ingrese el monto del anticipo (MXN)"
                  value={montoPersonalizado}
                  onChange={(e) => setMontoPersonalizado(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            )}
          </div>

          {/* 3. MÉTODO DE COBRO MULTIMODAL */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Método de Cobro en Terminal
            </label>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  metodoPago === "tarjeta"
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <CreditCard size={18} />
                <span className="text-[11px] font-medium">TPV Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("spei")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  metodoPago === "spei"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <Send size={18} />
                <span className="text-[11px] font-medium">SPEI STP</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  metodoPago === "efectivo"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <Banknote size={18} />
                <span className="text-[11px] font-medium">Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("financiamiento")}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  metodoPago === "financiamiento"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <Calendar size={18} />
                <span className="text-[11px] font-medium">Crédito</span>
              </button>
            </div>

            {/* Sub-interfaces depending on payment method */}
            {metodoPago === "efectivo" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Monto Exacto a Cubrir:</span>
                  <span className="font-mono font-bold text-white">{formatMXN(totalACobrar)}</span>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Efectivo Entregado por Cliente:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={efectivoRecibido}
                      onChange={(e) => setEfectivoRecibido(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/50 border border-emerald-500/40 rounded-lg text-white font-mono outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setEfectivoRecibido(totalACobrar.toString())}
                      className="px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 text-[11px] font-bold"
                    >
                      Exacto
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center">
                  <span className="font-bold text-neutral-300">Cambio / Vuelto a Devolver:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {formatMXN(cambioEfectivo)}
                  </span>
                </div>
              </div>
            )}

            {metodoPago === "spei" && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">CLABE STP Institucional:</span>
                  <span className="font-mono text-cyan-300 font-bold">646180157000002026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Beneficiario:</span>
                  <span className="font-bold text-white">LOCADEDCAR MOTORS SA DE CV</span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  La transacción se validará con acuse CEP en el folio de venta.
                </p>
              </div>
            )}

            {metodoPago === "financiamiento" && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Plazo Seleccionado:</span>
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
                          ? "bg-purple-500 text-white border-purple-400"
                          : "bg-white/5 text-neutral-400 border-white/10"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center">
                  <span className="text-neutral-300">Cuota Mensual Proyectada:</span>
                  <span className="font-mono font-bold text-purple-300">
                    {formatMXN(totalACobrar / plazoMeses)} / mes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. FINANCIAL SUMMARY & EXECUTION BUTTON */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-black to-white/[0.02] border border-amber-500/30 space-y-3 shadow-2xl">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal (Base):</span>
                <span>{formatMXN(totalACobrar / 1.16)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>IVA Trasladado (16%):</span>
                <span>{formatMXN(totalACobrar - totalACobrar / 1.16)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Total a Procesar:
                </span>
                <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                  {formatMXN(totalACobrar)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleProcessSale}
              disabled={loading || !selectedCar || selectedCar.estado === "vendido"}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-black shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                  Autorizando Transacción Atómica...
                </>
              ) : selectedCar?.estado === "vendido" ? (
                "Unidad Vendida / No Disponible"
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Procesar Despacho y Emitir Ticket POS
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE TICKET FISCAL Y RECIBO IMPRIMIBLE */}
      <POSTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        ticket={ticketData}
      />

      {/* 4. CORTE DE CAJA / HISTORIAL DEL TURNO (DRAWER LATERAL) */}
      <AnimatePresence>
        {showShiftDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-md bg-[#0a0c10] border-l border-white/15 h-full p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-cyan-400" />
                    <h3 className="font-bold text-white text-base">Corte de Caja // Turno Actual</h3>
                  </div>
                  <button
                    onClick={() => setShowShiftDrawer(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-400">Total Recaudado en Mostrador</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono">
                      {formatMXN(
                        cars
                          .filter((c) => c.estado === "vendido")
                          .reduce((acc, c) => acc + c.precio, 0)
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-neutral-400 block text-[10px]">Unidades Vendidas</span>
                      <span className="text-lg font-bold text-white">
                        {cars.filter((c) => c.estado === "vendido").length} autos
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-neutral-400 block text-[10px]">Stock Disponible</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {cars.filter((c) => c.estado === "disponible").length} autos
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      Últimos Despachos Registrados
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cars
                        .filter((c) => c.estado === "vendido")
                        .slice(0, 5)
                        .map((car) => (
                          <div
                            key={car.id}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">{car.marca} {car.modelo}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">{car.anio} • Vendido</p>
                            </div>
                            <span className="font-mono text-amber-400 font-semibold">
                              {formatMXN(car.precio)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                >
                  <Receipt size={16} /> Imprimir Cierre de Turno
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
