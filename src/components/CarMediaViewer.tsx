"use client";

import { useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

interface DBColor {
  nombre: string;
  hex: string;
  imagenUrl: string;
}

interface CarMediaViewerProps {
  imageUrl: string;
  brand: string;
  model: string;
  status: string;
  dbColors?: DBColor[];
}

export default function CarMediaViewer({ imageUrl, brand, model, status, dbColors = [] }: CarMediaViewerProps) {
  // Si hay colores en DB, usamos el primero como default. Si no, usamos null.
  const [selectedDBColor, setSelectedDBColor] = useState<DBColor | null>(dbColors.length > 0 ? dbColors[0] : null);

  // Framer motion Parallax / Tilt effect variables
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const currentImage = selectedDBColor ? selectedDBColor.imagenUrl : imageUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* Visualizador Principal Interactivo */}
      <div 
        className="relative aspect-video rounded-3xl overflow-hidden glass shadow-2xl cursor-crosshair bg-black/5"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* AnimatePresence for smooth crossfades between images */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImage} // Cambiar la key fuerza el remount y la animación
              src={currentImage} 
              alt={`${brand} ${model}`} 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          </AnimatePresence>

          {/* Brillo dinámico superpuesto para más realismo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay" />
        </motion.div>
        
        {/* Etiqueta de Estado */}
        <div className="absolute top-4 right-4 pointer-events-none z-10">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md shadow-lg ${
            status === 'disponible' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Selector de Colores Integrado (Solo se muestra si el auto tiene variaciones de color en DB) */}
      {dbColors.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-panel p-5 rounded-2xl">
          <span className="text-sm text-white/70 tracking-wide uppercase font-medium">
            Configuración: <span className="text-white ml-2">{selectedDBColor?.nombre}</span>
          </span>
          <div className="flex gap-4">
            {dbColors.map((color) => (
              <button
                key={color.nombre}
                onClick={() => setSelectedDBColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ease-out ${
                  selectedDBColor?.nombre === color.nombre 
                    ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                    : 'border-white/20 hover:scale-110 hover:border-white/50 opacity-70 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: color.hex,
                  background: color.hex.toLowerCase() === '#ffffff' ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' : color.hex
                }}
                aria-label={color.nombre}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
