"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import CarCard from "@/components/CarCard";

interface CatalogGridProps {
  cars: Vehiculo[];
}

const FILTERS = ["Todos", "Deportivo", "Semideportivo", "Porsche", "Audi", "Mercedes-Benz", "Ferrari"];

export default function CatalogGrid({ cars }: CatalogGridProps) {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // 1. Filtrar por categoría (Píldoras)
      const matchesFilter =
        activeFilter === "Todos" ||
        car.tipo.toLowerCase() === activeFilter.toLowerCase() ||
        car.marca.toLowerCase() === activeFilter.toLowerCase();

      // 2. Filtrar por búsqueda de texto
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        car.marca.toLowerCase().includes(searchLower) ||
        car.modelo.toLowerCase().includes(searchLower) ||
        car.detalles.toLowerCase().includes(searchLower);

      return matchesFilter && matchesSearch;
    });
  }, [cars, activeFilter, searchQuery]);

  return (
    <div className="w-full">
      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        
        {/* Píldoras de Categoría */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Grid de Autos Animado */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCars.map((car, index) => (
            <motion.div
              key={car.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <CarCard car={car} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredCars.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 glass rounded-3xl mt-8"
        >
          <p className="text-white/50 text-lg">No se encontraron vehículos que coincidan con tu búsqueda.</p>
          <button 
            onClick={() => { setActiveFilter("Todos"); setSearchQuery(""); }}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            Limpiar Filtros
          </button>
        </motion.div>
      )}
    </div>
  );
}
