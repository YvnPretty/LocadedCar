"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Car, 
  CreditCard, 
  UserCheck, 
} from "lucide-react";

export interface POSTicketData {
  transaccionId: string;
  folio: string;
  fecha: string | Date;
  modalidad: string;
  metodoPago: string;
  montoTotal: number;
  montoRecibido: number;
  cambio: number;
  descuento: number;
  plazoMeses?: number | null;
  estadoUnidad: string;
  vehiculo: {
    id: string;
    marca: string;
    modelo: string;
    anio: number;
    precioOriginal: number;
    tipo: string;
    imagenUrl?: string | null;
    color?: { nombre: string; hex: string } | null;
    vinVirtual: string;
  };
  cliente: {
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
    rfc?: string;
    direccion?: string;
  };
  vendedor: {
    id: string;
    nombre: string;
  };
}

interface POSTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: POSTicketData | null;
}

export default function POSTicketModal({ isOpen, onClose, ticket }: POSTicketModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !ticket) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  const fechaFormateada = new Date(ticket.fecha).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handlePrint = () => {
    window.print();
  };

  const getMetodoPagoLabel = (metodo: string) => {
    switch (metodo) {
      case "tarjeta":
        return "Terminal TPV Black Card (NFC/Chip)";
      case "spei":
        return "Transferencia Interbancaria SPEI (STP)";
      case "efectivo":
        return "Efectivo en Mostrador (Divisas MXN)";
      case "financiamiento":
        return `Crédito Concesionaria (${ticket.plazoMeses || 24} Meses)`;
      default:
        return metodo.toUpperCase();
    }
  };

  const getModalidadLabel = (mod: string) => {
    switch (mod) {
      case "contado":
        return "Liquidación Total (100%)";
      case "apartado_10":
        return "Reserva / Apartado de Unidad (10%)";
      case "personalizado":
        return "Enganche Comercial Personalizado";
      default:
        return mod;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          role="dialog" aria-modal="true" aria-label="Recibo de operación"
          className="relative w-full max-w-xl my-8 bg-[#0a0a0c] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl text-white"
        >
          {/* Action Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                Transacción Exitosa // POS-APPROVED
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar recibo"
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* PRINTABLE RECEIPT CARD */}
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="mt-4 p-6 md:p-8 bg-[#0d0f12] border border-white/15 rounded-2xl relative overflow-hidden font-sans text-neutral-200"
          >
            {/* Holographic Watermark Glow */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-white/10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-wider text-amber-300 mb-2">
                <Sparkles size={12} /> LOCADEDCAR LUXURY MOTORS POS
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                RECIBO DE OPERACIÓN
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                LocadedCar · Comprobante interno, no es factura fiscal
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 text-xs font-mono text-neutral-300">
                <span>FOLIO: <strong className="text-amber-400">{ticket.folio}</strong></span>
                <span>•</span>
                <span>{fechaFormateada}</span>
              </div>
            </div>

            {/* Vehicle Card Section */}
            <div className="py-4 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Car size={12} /> Unidad Despachada
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {ticket.vehiculo.marca} {ticket.vehiculo.modelo} ({ticket.vehiculo.anio})
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    {ticket.vehiculo.vinVirtual}
                  </p>
                </div>
                {ticket.vehiculo.color && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-neutral-400 block mb-1">Color</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{ backgroundColor: ticket.vehiculo.color.hex }}
                      ></span>
                      {ticket.vehiculo.color.nombre}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 bg-white/5 p-2 rounded-lg">
                <span>Estado de Entrega:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wide">
                  {ticket.estadoUnidad === "vendido" ? "Asignado para Entrega Inmediata" : "Apartado confirmado"}
                </span>
              </div>
            </div>

            {/* Client & Advisor Section */}
            <div className="py-4 border-b border-white/10 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <UserCheck size={12} /> Comprador VIP
                </span>
                <p className="font-bold text-white mt-1">{ticket.cliente.nombre}</p>
                <p className="text-neutral-400 truncate">{ticket.cliente.correo}</p>
                <p className="text-neutral-400">Tel: {ticket.cliente.telefono}</p>
                <p className="text-neutral-500 font-mono">RFC: {ticket.cliente.rfc || "XAXX010101000"}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Asesor / Cajero
                </span>
                <p className="font-bold text-white mt-1">{ticket.vendedor.nombre}</p>
                <p className="text-neutral-400">Estación: LOCADED-POS-01</p>
                <p className="text-neutral-500 font-mono">Turno: Matutino / Ejecutivo</p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="py-4 border-b border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Precio de Lista:</span>
                <span>{formatCurrency(ticket.vehiculo.precioOriginal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Modalidad Aplicada:</span>
                <span className="text-amber-300 font-medium">{getModalidadLabel(ticket.modalidad)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal (Base Imponible):</span>
                <span>{formatCurrency(ticket.montoTotal / 1.16)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>IVA (16% Trasladado):</span>
                <span>{formatCurrency(ticket.montoTotal - ticket.montoTotal / 1.16)}</span>
              </div>
              
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Total Cobrado:
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(ticket.montoTotal)}
                </span>
              </div>

              {/* Cash specific details */}
              {ticket.metodoPago === "efectivo" && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Efectivo Recibido:</span>
                    <span className="font-mono">{formatCurrency(ticket.montoRecibido)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Cambio Entregado:</span>
                    <span className="font-mono">{formatCurrency(ticket.cambio)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Badge */}
            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-amber-400" />
                <span className="text-neutral-300">{getMetodoPagoLabel(ticket.metodoPago)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck size={14} /> REGISTRADO
              </div>
            </div>

            {/* Legal Signatures */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-6 text-center text-[10px] text-neutral-400">
              <div>
                <div className="h-8 border-b border-white/20 mx-4 mb-1"></div>
                <span>Firma del Asesor de Venta</span>
              </div>
              <div>
                <div className="h-8 border-b border-white/20 mx-4 mb-1"></div>
                <span>Firma de Conformidad del Cliente</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/10"
            >
              <Printer size={18} /> Imprimir recibo
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar recibo"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              <CheckCircle2 size={18} /> Nueva Transacción en Terminal
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
