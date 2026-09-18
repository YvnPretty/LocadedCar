"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Terminal,
  Sparkles,
  DollarSign,
  Layers,
  X,
  RefreshCw
} from "lucide-react";

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

export default function InventarioClient({ initialCars }: { initialCars: Vehiculo[] }) {
  const [cars, setCars] = useState<Vehiculo[]>(initialCars);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // New Car Form State
  const [newCar, setNewCar] = useState({
    marca: "",
    modelo: "",
    anio: 2024,
    precio: 3500000,
    tipo: "deportivo",
    estado: "disponible",
    imagenUrl: "",
    detalles: ""
  });

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  const filtered = cars.filter((c) => {
    const matchesSearch =
      c.marca.toLowerCase().includes(search.toLowerCase()) ||
      c.modelo.toLowerCase().includes(search.toLowerCase()) ||
      c.anio.toString().includes(search);

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    return c.estado === statusFilter;
  });

  // Toggle vehicle status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "disponible" ? "vendido" : "disponible";
    setLoadingAction(id);

    try {
      const res = await fetch("/api/admin/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", id, estado: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCars((prev) =>
          prev.map((item) => (item.id === id ? { ...item, estado: nextStatus } : item))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  // Create new car
  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.marca || !newCar.modelo || !newCar.precio) return;

    try {
      const res = await fetch("/api/admin/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCar)
      });
      const data = await res.json();
      if (data.success) {
        setCars([data.vehiculo, ...cars]);
        setShowAddModal(false);
        setNewCar({
          marca: "",
          modelo: "",
          anio: 2024,
          precio: 3500000,
          tipo: "deportivo",
          estado: "disponible",
          imagenUrl: "",
          detalles: ""
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">
              CATÁLOGO MAESTRO & STOCK
            </span>
            <span className="text-xs text-neutral-400">Control de Activos Vehiculares</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Gestión Integral de Inventario</h1>
          <p className="text-xs text-neutral-400">
            Supervisa disponibilidad en piso, precios de lista, configuración y alta de nuevas unidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus size={16} /> Dar de Alta Unidad
          </button>
        </div>
      </div>

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-neutral-400 block text-[10px]">Total en Flota</span>
          <span className="text-xl font-bold text-white font-mono">{cars.length} unidades</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-neutral-400 block text-[10px]">Disponibles para Venta</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            {cars.filter((c) => c.estado === "disponible").length}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-neutral-400 block text-[10px]">Unidades Vendidas</span>
          <span className="text-xl font-bold text-red-400 font-mono">
            {cars.filter((c) => c.estado === "vendido").length}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-neutral-400 block text-[10px]">Valor Total de Inventario</span>
          <span className="text-base font-black text-amber-300 font-mono truncate block">
            {formatMXN(cars.reduce((acc, c) => acc + c.precio, 0))}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo o año..."
            className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {["ALL", "disponible", "apartado", "vendido"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all capitalize whitespace-nowrap ${
                statusFilter === st
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white/5 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              {st === "ALL" ? "Todos los Estados" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Cars Grid Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead className="bg-white/5 border-b border-white/10 text-neutral-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio Lista (MXN)</th>
                <th className="py-3 px-4 text-center">Estado en Sistema</th>
                <th className="py-3 px-4 text-center">Cambio Rápido</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((car) => {
                const isDispo = car.estado === "disponible";

                return (
                  <tr key={car.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.imagenUrl || "/renders/audi_r8_red.jpg"}
                          alt={car.modelo}
                          className="w-14 h-10 object-cover rounded-lg border border-white/10"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                            {car.marca}
                          </span>
                          <h4 className="font-bold text-white leading-tight">
                            {car.modelo} ({car.anio})
                          </h4>
                          <span className="text-[10px] text-neutral-500 line-clamp-1">
                            {car.detalles}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-neutral-300">
                        {car.tipo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-amber-400 text-sm">
                      {formatMXN(car.precio)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDispo
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : car.estado === "apartado"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {car.estado}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(car.id, car.estado)}
                        disabled={loadingAction === car.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                        title="Alternar entre Disponible y Vendido"
                      >
                        {loadingAction === car.id
                          ? "Actualizando..."
                          : isDispo
                          ? "Marcar Vendido"
                          : "Reactivar"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/catalogo/${car.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="Ver Ficha 3D de Cliente"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href="/pos"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                          title="Cargar a Terminal POS"
                        >
                          <Terminal size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ALTA DE NUEVO VEHÍCULO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e1117] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                <Car size={18} /> Registrar Nuevo Vehículo en Flota
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCar} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Marca:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Porsche, Ferrari"
                    value={newCar.marca}
                    onChange={(e) => setNewCar({ ...newCar, marca: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Modelo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 911 GT3 RS"
                    value={newCar.modelo}
                    onChange={(e) => setNewCar({ ...newCar, modelo: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Año Modelo:</label>
                  <input
                    type="number"
                    value={newCar.anio}
                    onChange={(e) => setNewCar({ ...newCar, anio: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Precio de Lista (MXN):</label>
                  <input
                    type="number"
                    required
                    value={newCar.precio}
                    onChange={(e) => setNewCar({ ...newCar, precio: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Carrocería:</label>
                  <select
                    value={newCar.tipo}
                    onChange={(e) => setNewCar({ ...newCar, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    <option value="deportivo" className="bg-neutral-900">Deportivo</option>
                    <option value="semideportivo" className="bg-neutral-900">Semideportivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Estado Inicial:</label>
                  <select
                    value={newCar.estado}
                    onChange={(e) => setNewCar({ ...newCar, estado: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    <option value="disponible" className="bg-neutral-900">Disponible</option>
                    <option value="apartado" className="bg-neutral-900">Apartado</option>
                    <option value="vendido" className="bg-neutral-900">Vendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">URL de Imagen Principal:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCar.imagenUrl}
                  onChange={(e) => setNewCar({ ...newCar, imagenUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Especificaciones Técnicas / Motor:</label>
                <textarea
                  rows={2}
                  placeholder="Motor, potencia en HP, aceleración 0-100 km/h..."
                  value={newCar.detalles}
                  onChange={(e) => setNewCar({ ...newCar, detalles: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
