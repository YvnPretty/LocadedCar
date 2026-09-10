"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  Truck, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Car, 
  Printer, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BadgeCheck 
} from "lucide-react";
import type { Vehiculo, ColorVariante } from "@prisma/client";

interface VehiculoConColores extends Vehiculo {
  colores?: ColorVariante[];
}

export default function CheckoutClient({
  cars,
  initialCar
}: {
  cars: VehiculoConColores[];
  initialCar?: VehiculoConColores;
}) {
  const [selectedCar, setSelectedCar] = useState<VehiculoConColores>(initialCar || cars[0]);
  const [selectedColor, setSelectedColor] = useState<string>(
    selectedCar?.colores?.[0]?.nombre || "Original de Fábrica"
  );
  
  // Modalidad: "total" (100%) o "apartado" (10% para apartar el chasis)
  const [modalidad, setModalidad] = useState<"total" | "apartado">("total");

  // Pasos: 1 = Datos, 2 = Pago, 3 = Revisión
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Formulario del Comprador
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "Ciudad de México",
    estado: "CDMX",
    rfc: "",
    notas: ""
  });

  // Método de pago: "card" | "spei" | "finance"
  const [paymentMethod, setPaymentMethod] = useState<"card" | "spei" | "finance">("card");

  // Datos de tarjeta
  const [cardData, setCardData] = useState({
    numero: "",
    titular: "",
    expira: "",
    cvv: ""
  });

  // Plazo financiamiento (meses)
  const [plazoMeses, setPlazoMeses] = useState<12 | 24 | 36>(24);

  // Estados de proceso y éxito
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!selectedCar) {
    return (
      <main className="min-h-screen pt-32 pb-24 text-center">
        <p className="text-white/60">No hay vehículos disponibles para procesar el pago.</p>
        <Link href="/catalogo" className="mt-4 inline-block glass-button px-6 py-2 rounded-full text-white">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  // Cálculos financieros
  const precioBase = selectedCar.precio;
  const montoAPagar = modalidad === "total" ? precioBase : Math.round(precioBase * 0.10);
  const fleteBlindado = 0; // Cortesía VIP
  const seguroTraslado = 0; // Incluido

  const cuotaMensual = Math.round((precioBase * 0.90 * 1.12) / plazoMeses);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value
    });
  };

  // Validaciones
  const canProceedStep1 = formData.nombre.trim() !== "" && formData.correo.trim() !== "" && formData.telefono.trim() !== "";
  
  const canProceedStep2 = 
    paymentMethod === "spei" || 
    paymentMethod === "finance" || 
    (paymentMethod === "card" && cardData.numero.length >= 15 && cardData.titular.trim() !== "" && cardData.cvv.length >= 3);

  // Enviar pago al backend
  const handleFinalizarPago = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const payload = {
        vehiculoId: selectedCar.id,
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        estado: formData.estado,
        rfc: formData.rfc,
        montoTotal: montoAPagar,
        metodoPago: paymentMethod === "card" ? "Tarjeta de Crédito / Débito" : paymentMethod === "spei" ? "Transferencia Interbancaria SPEI" : "Financiamiento VIP",
        modalidad: modalidad === "total" ? "Liquidación Total 100%" : "Apartado de Chasis (10% de Anticipo)"
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar el pago.");
      }

      setReceiptData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo completar la transacción. Verifica tus datos.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado y Barra de Pasos */}
        <div className="mb-10">
          <Link href={`/catalogo/${selectedCar.id}`} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} />
            Volver a detalles del auto
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-light tracking-tight">
                Proceder al <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Pago & Adquisición</span>
              </h1>
              <p className="text-white/50 text-sm md:text-base mt-1">
                Plataforma de liquidación segura y apartado oficial de chasis para vehículos deportivos de alta gama.
              </p>
            </div>

            {/* Stepper Visual */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${step >= 1 ? "bg-red-500 text-white" : "bg-white/10 text-white/40"}`}>1</span>
              <span className="text-xs text-white/60">Datos</span>
              <span className="text-white/20">➔</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${step >= 2 ? "bg-red-500 text-white" : "bg-white/10 text-white/40"}`}>2</span>
              <span className="text-xs text-white/60">Pago</span>
              <span className="text-white/20">➔</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${step === 3 ? "bg-red-500 text-white" : "bg-white/10 text-white/40"}`}>3</span>
              <span className="text-xs text-white/60">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Layout Principal Responsive: Formulario (7 cols) + Resumen Sticky (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= COLUMNA IZQUIERDA: FORMULARIO PASO A PASO ================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Selector de Modalidad (Contado vs Apartado) */}
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Modalidad de Adquisición
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalidad("total")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    modalidad === "total"
                      ? "bg-gradient-to-r from-red-500/20 to-amber-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-white">Pago de Contado (100%)</p>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Entrega Inmediata</span>
                  </div>
                  <p className="text-xs text-white/50">Liquidación total del vehículo con facturación inmediata y entrega en puerta.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setModalidad("apartado")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    modalidad === "apartado"
                      ? "bg-gradient-to-r from-red-500/20 to-amber-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-white">Apartado de Chasis (10%)</p>
                    <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Congelar Precio</span>
                  </div>
                  <p className="text-xs text-white/50">Garantiza la unidad por 15 días con solo el 10% de anticipo reembolsable.</p>
                </button>
              </div>
            </div>

            {/* PASO 1: DATOS DEL TITULAR Y ENTREGA */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="glass rounded-3xl p-6 sm:p-8 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Datos del Titular y Entrega</h3>
                      <p className="text-xs text-white/40">Información para la factura comercial y entrega blindada.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40">Paso 1 de 3</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Nombre Completo del Titular *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej. Carlos Mendoza Herrera"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Correo Electrónico *</label>
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="carlos@ejemplo.com"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Teléfono Celular / WhatsApp *</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="+52 55 1234 5678"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Dirección de Entrega VIP (Calle, Número y Colonia)</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Av. Paseo de las Palmas 1200, Lomas de Chapultepec"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Ciudad</label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Estado</label>
                      <input
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">RFC (Para Facturación)</label>
                      <input
                        type="text"
                        name="rfc"
                        value={formData.rfc}
                        onChange={handleInputChange}
                        placeholder="XAXX010101000"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white uppercase focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Continuar al Método de Pago</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASO 2: SELECCIÓN Y CONFIGURACIÓN DE PAGO */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="glass rounded-3xl p-6 sm:p-8 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Método de Pago Seguro</h3>
                      <p className="text-xs text-white/40">Cifrado de 256 bits y protección antifraude bancaria.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40">Paso 2 de 3</span>
                </div>

                {/* Pestañas de método de pago */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2 border transition-all ${
                      paymentMethod === "card"
                        ? "bg-white/15 border-white/40 text-white shadow-md"
                        : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Tarjeta Bancaria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("spei")}
                    className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2 border transition-all ${
                      paymentMethod === "spei"
                        ? "bg-white/15 border-white/40 text-white shadow-md"
                        : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <Building2 size={18} />
                    <span>SPEI / Banco</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("finance")}
                    className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2 border transition-all ${
                      paymentMethod === "finance"
                        ? "bg-white/15 border-white/40 text-white shadow-md"
                        : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <Sparkles size={18} />
                    <span>Financiamiento</span>
                  </button>
                </div>

                {/* Subformulario según método */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    {/* Tarjeta Visual de Alta Gama */}
                    <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-6 bg-gradient-to-tr from-[#1a1a1a] via-[#2d1b1b] to-[#111] border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest text-white/40 font-mono">LOCADEDCAR BLACK CARD</span>
                        <div className="flex gap-1">
                          <span className="w-6 h-6 rounded-full bg-red-500/80 inline-block"></span>
                          <span className="w-6 h-6 rounded-full bg-amber-500/80 -ml-3 inline-block"></span>
                        </div>
                      </div>

                      <div className="text-lg tracking-widest font-mono text-white/90">
                        {cardData.numero || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Titular</p>
                          <p className="font-medium text-white truncate max-w-[180px]">{cardData.titular || formData.nombre || "NOMBRE DEL TITULAR"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Expira</p>
                          <p className="font-medium text-white">{cardData.expira || "MM/AA"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Número de Tarjeta</label>
                        <input
                          type="text"
                          name="numero"
                          value={cardData.numero}
                          onChange={handleCardChange}
                          placeholder="4520 1234 5678 9010"
                          maxLength={19}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-white/30 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-white/70 mb-1.5">Nombre en la Tarjeta</label>
                          <input
                            type="text"
                            name="titular"
                            value={cardData.titular}
                            onChange={handleCardChange}
                            placeholder="Como aparece en el plástico"
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white uppercase placeholder-white/30 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1.5">CVV / CVC</label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white text-center font-mono focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Fecha de Vencimiento</label>
                        <input
                          type="text"
                          name="expira"
                          value={cardData.expira}
                          onChange={handleCardChange}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white text-center font-mono focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "spei" && (
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Building2 size={24} />
                      <h4 className="font-semibold text-white">Transferencia Electrónica Directa (SPEI VIP)</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Al confirmar tu orden, se generará una referencia única de rastreo con validación instantánea vía Banxico. No aplican comisiones por transacción.
                    </p>

                    <div className="space-y-2 bg-black/40 p-4 rounded-xl text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/40">Banco Destino:</span>
                        <span className="text-white font-bold">STP / BBVA Bancomer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Beneficiario:</span>
                        <span className="text-white">LOCADEDCAR MOTORS S.A. DE C.V.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">CLABE Interbancaria:</span>
                        <span className="text-amber-300 font-bold">6461 8015 7000 9988 22</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Concepto / Referencia:</span>
                        <span className="text-white">{selectedCar.modelo.toUpperCase().replace(/\s+/g, '')}-VIP</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "finance" && (
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Plan de Financiamiento a tu Medida</h4>
                      <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Tasa Preferencial 9.8%</span>
                    </div>

                    <p className="text-xs text-white/60">
                      Selecciona el plazo para el 90% restante del valor del vehículo con aprobación crediticia inmediata:
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {[12, 24, 36].map((meses) => (
                        <button
                          key={meses}
                          type="button"
                          onClick={() => setPlazoMeses(meses as any)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            plazoMeses === meses
                              ? "bg-red-500/20 border-red-500 text-white"
                              : "bg-white/5 border-white/10 text-white/60"
                          }`}
                        >
                          <p className="text-sm font-bold">{meses} Meses</p>
                          <p className="text-[11px] text-white/40">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round((precioBase * 0.90 * 1.12) / meses))}/mes
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Regresar
                  </button>

                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-medium flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Revisar Orden</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASO 3: REVISIÓN Y CONFIRMACIÓN FINAL */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="glass rounded-3xl p-6 sm:p-8 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Confirmar Orden de Compra</h3>
                      <p className="text-xs text-white/40">Verifica los datos antes de emitir el folio oficial.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40">Paso 3 de 3</span>
                </div>

                <div className="space-y-4">
                  {/* Resumen del titular */}
                  <div className="bg-white/5 p-4 rounded-2xl space-y-2 text-xs">
                    <p className="text-white/40 font-semibold uppercase tracking-wider text-[10px]">Titular Registrado</p>
                    <div className="flex justify-between">
                      <span className="text-white/60">Nombre:</span>
                      <span className="font-semibold text-white">{formData.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Correo:</span>
                      <span className="text-white">{formData.correo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Teléfono:</span>
                      <span className="text-white">{formData.telefono}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Destino de Entrega:</span>
                      <span className="text-white truncate max-w-[240px]">{formData.direccion || "A convenir con Concierge VIP"}, {formData.ciudad}</span>
                    </div>
                  </div>

                  {/* Resumen del método */}
                  <div className="bg-white/5 p-4 rounded-2xl space-y-2 text-xs">
                    <p className="text-white/40 font-semibold uppercase tracking-wider text-[10px]">Modalidad & Pago</p>
                    <div className="flex justify-between">
                      <span className="text-white/60">Tipo de Adquisición:</span>
                      <span className="text-amber-300 font-semibold">
                        {modalidad === "total" ? "Liquidación Total 100%" : "Apartado de Chasis (10% Anticipo)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Método de Cobro:</span>
                      <span className="text-white">
                        {paymentMethod === "card" ? `Tarjeta Crédito/Débito (terminada en ${cardData.numero.slice(-4) || "••••"})` : paymentMethod === "spei" ? "Transferencia Interbancaria SPEI" : `Financiamiento a ${plazoMeses} meses`}
                      </span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Aviso legal */}
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Al presionar el botón de pago, autorizas la emisión del contrato de compraventa y la reserva inmediata del número de chasis en nuestro inventario. Transacción protegida por contrato con firma digital.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Modificar Pago
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleFinalizarPago}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando Transacción...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>Confirmar y Pagar {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(montoAPagar)}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* ================= COLUMNA DERECHA: RESUMEN DE VEHÍCULO STICKY ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            
            {/* Tarjeta del Auto Elegido */}
            <div className="glass rounded-3xl p-6 border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-white/40">Resumen de la Unidad</span>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                  selectedCar.estado === "disponible" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}>
                  {selectedCar.estado.toUpperCase()}
                </span>
              </div>

              {/* Imagen */}
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                <img 
                  src={selectedCar.imagenUrl || ""} 
                  alt={selectedCar.modelo} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs text-white/60 font-mono uppercase">{selectedCar.marca}</p>
                  <p className="text-xl font-bold text-white">{selectedCar.modelo} • {selectedCar.anio}</p>
                </div>
              </div>

              {/* Selector de Auto Alternativo (si desea cambiar) */}
              <div className="mb-4">
                <label className="block text-[11px] font-medium text-white/50 mb-1">Cambiar vehículo seleccionado:</label>
                <select
                  value={selectedCar.id}
                  onChange={(e) => {
                    const found = cars.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedCar(found);
                      setSelectedColor(found.colores?.[0]?.nombre || "Original");
                    }
                  }}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111] text-white">
                      {c.marca} {c.modelo} ({c.anio}) - {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(c.precio)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de color si tiene variantes */}
              {selectedCar.colores && selectedCar.colores.length > 0 && (
                <div className="mb-6 pt-2 border-t border-white/10">
                  <p className="text-[11px] text-white/50 mb-2">Variante de Color Elegida:</p>
                  <div className="flex gap-2">
                    {selectedCar.colores.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedColor(col.nombre)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-all ${
                          selectedColor === col.nombre ? "border-white bg-white/20 text-white font-medium" : "border-white/10 bg-white/5 text-white/60"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: col.hex }}></span>
                        <span>{col.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Desglose de Precios */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Precio de Lista:</span>
                  <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precioBase)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span className="flex items-center gap-1">
                    <span>Flete en Plataforma Blindada:</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">Cortesía</span>
                  </span>
                  <span className="text-emerald-400">$0.00 MXN</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Seguro de Traslado y Trámites:</span>
                  <span className="text-emerald-400">$0.00 MXN</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wide">Total a Pagar Hoy:</p>
                    {modalidad === "apartado" && (
                      <p className="text-[10px] text-amber-300">Anticipo de Apartado (10%)</p>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(montoAPagar)}
                  </p>
                </div>
              </div>

              {/* Garantías de seguridad */}
              <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-[11px] text-white/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Inspección 150 Puntos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Pago Protegido SSL</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= MODAL DE ÉXITO / COMPROBANTE OFICIAL ================= */}
      <AnimatePresence>
        {receiptData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0c0c0c] border border-white/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_0_80px_rgba(255,255,255,0.1)] text-white relative my-8"
            >
              {/* Badge de éxito */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>

              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  ¡Transacción Exitosa!
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3">Comprobante de Adquisición</h2>
                <p className="text-white/50 text-xs mt-1">
                  Tu solicitud ha sido procesada y el chasis ha quedado reservado a tu nombre.
                </p>
              </div>

              {/* Ticket de compra */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 text-xs font-mono mb-6">
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-white/40">Folio de Transacción:</span>
                  <span className="text-amber-400 font-bold truncate max-w-[200px]">{receiptData.transaccionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Fecha:</span>
                  <span>{new Date(receiptData.fecha).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Vehículo:</span>
                  <span className="text-white font-bold">{receiptData.vehiculo.marca} {receiptData.vehiculo.modelo} ({receiptData.vehiculo.anio})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Titular / Cliente:</span>
                  <span>{receiptData.cliente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Modalidad:</span>
                  <span>{receiptData.modalidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Método de Pago:</span>
                  <span>{receiptData.metodoPago}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-sm font-sans">
                  <span className="font-semibold text-white">Monto Liquidado:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(receiptData.montoTotal)}
                  </span>
                </div>
              </div>

              {/* Mensaje de Atención VIP */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-amber-200">
                <BadgeCheck size={20} className="flex-shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Un asesor de nuestro equipo <strong>Concierge VIP</strong> se pondrá en contacto contigo vía WhatsApp o llamada en los próximos 15 minutos para coordinar la entrega o firma de documentación.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl glass-button text-xs font-medium flex items-center justify-center gap-2 text-white"
                >
                  <Printer size={16} />
                  Imprimir Comprobante
                </button>

                <Link
                  href="/catalogo"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-xs font-semibold text-center text-white flex items-center justify-center gap-2 shadow-lg"
                >
                  Volver al Catálogo
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
