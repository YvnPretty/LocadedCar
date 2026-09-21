"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import CarCard from "@/components/CarCard";

interface CatalogGridProps {
  cars: Vehiculo[];
}

export default function CatalogGrid({ cars }: CatalogGridProps) {
  const brandOptions = useMemo(
    () => Array.from(new Set(cars.map((car) => car.marca))).sort((a, b) => a.localeCompare(b)),
    [cars],
  );

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(cars.map((car) => car.tipo.charAt(0).toUpperCase() + car.tipo.slice(1)))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [cars],
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(car.marca);
      const capitalizedCarType = car.tipo.charAt(0).toUpperCase() + car.tipo.slice(1);
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(capitalizedCarType);
      return matchBrand && matchType;
    });
  }, [cars, selectedBrands, selectedTypes]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 items-start">
      <aside className="w-full md:w-72 flex-shrink-0 mb-8 md:mb-0">
        <button
          type="button"
          onClick={() => setIsFiltersOpen((open) => !open)}
          className="md:hidden w-full flex items-center justify-between px-4 py-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white"
          aria-expanded={isFiltersOpen}
        >
          <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filtrar colección</span>
          {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className={`${isFiltersOpen ? "block" : "hidden"} md:block glass rounded-3xl p-5 soft-ring`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white">Filtros</h3>
            <div className="rounded-full bg-white/5 p-2 text-white/70">
              <SlidersHorizontal size={16} />
            </div>
          </div>

          <div className="border-t border-white/10 py-4">
            <button
              type="button"
              onClick={() => setIsBrandOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors mb-2"
            >
              <span className="font-medium">Marca</span>
              {isBrandOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <AnimatePresence>
              {isBrandOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-3 mt-4"
                >
                  {brandOptions.map((brand) => {
                    const checked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`flex items-center gap-3 cursor-pointer group px-2 py-2 rounded-xl text-left transition-colors ${
                          checked ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                        aria-pressed={checked}
                      >
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            checked ? "bg-white border-white" : "border-white/30 group-hover:border-white/60 bg-transparent"
                          }`}
                        >
                          {checked && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </span>
                        <span className="text-white/70 group-hover:text-white transition-colors text-sm">{brand}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-white/10 py-4">
            <button
              type="button"
              onClick={() => setIsTypeOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors mb-2"
            >
              <span className="font-medium">Carrocerías</span>
              {isTypeOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <AnimatePresence>
              {isTypeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-3 mt-4"
                >
                  {typeOptions.map((type) => {
                    const checked = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`flex items-center gap-3 cursor-pointer group px-2 py-2 rounded-xl text-left transition-colors ${
                          checked ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                        aria-pressed={checked}
                      >
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            checked ? "bg-white border-white" : "border-white/30 group-hover:border-white/60 bg-transparent"
                          }`}
                        >
                          {checked && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </span>
                        <span className="text-white/70 group-hover:text-white transition-colors text-sm">{type}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(selectedBrands.length > 0 || selectedTypes.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedTypes([]);
              }}
              className="mt-4 w-full px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-white/50 text-sm font-medium">{filteredCars.length} modelos</p>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <CarCard car={car} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCars.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 glass rounded-3xl mt-8"
          >
            <p className="text-white/50 text-lg">No se encontraron vehículos que coincidan con tu búsqueda.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedTypes([]);
              }}
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
