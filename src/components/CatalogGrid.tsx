"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import CarCard from "@/components/CarCard";

interface CatalogGridProps {
  cars: Vehiculo[];
}

const BRANDS = ["Mercedes-Benz", "Porsche", "Audi", "Ferrari"];
const TYPES = ["Deportivo", "Semideportivo"];

export default function CatalogGrid({ cars }: CatalogGridProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Accordion state
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(car.marca);
      
      // Need to capitalize car.tipo because the seed uses lower case 'deportivo' but array has 'Deportivo'
      const capitalizedCarType = car.tipo.charAt(0).toUpperCase() + car.tipo.slice(1);
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(capitalizedCarType);
      
      return matchBrand && matchType;
    });
  }, [cars, selectedBrands, selectedTypes]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 items-start">
      
      {/* Sidebar de Filtros (Columna Izquierda) */}
      <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
        <h3 className="text-xl font-medium text-white mb-6">Filtros</h3>

        {/* Acordeón: Marca */}
        <div className="border-t border-white/10 py-4">
          <button 
            onClick={() => setIsBrandOpen(!isBrandOpen)}
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
                {BRANDS.map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedBrands.includes(brand) 
                        ? 'bg-white border-white' 
                        : 'border-white/30 group-hover:border-white/60 bg-transparent'
                    }`}>
                      {selectedBrands.includes(brand) && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                    <span className="text-white/70 group-hover:text-white transition-colors text-sm">{brand}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Acordeón: Carrocerías / Tipo */}
        <div className="border-t border-white/10 py-4">
          <button 
            onClick={() => setIsTypeOpen(!isTypeOpen)}
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
                {TYPES.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedTypes.includes(type) 
                        ? 'bg-white border-white' 
                        : 'border-white/30 group-hover:border-white/60 bg-transparent'
                    }`}>
                      {selectedTypes.includes(type) && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                    <span className="text-white/70 group-hover:text-white transition-colors text-sm">{type}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </aside>

      {/* Grid de Autos Animado (Columna Derecha) */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-white/50 text-sm font-medium">{filteredCars.length} modelos</p>
        </div>
        
        <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

        {/* Empty State */}
        {filteredCars.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 glass rounded-3xl mt-8"
          >
            <p className="text-white/50 text-lg">No se encontraron vehículos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => { setSelectedBrands([]); setSelectedTypes([]); }}
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              Limpiar Filtros
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
