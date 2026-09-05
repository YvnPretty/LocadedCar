"use client";

import { useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CarMediaViewerProps {
  imageUrl: string;
  brand: string;
  model: string;
  status: string;
}

const COLORS = [
  { name: "Original", hex: "#ffffff", hueRotate: "0deg", saturate: "1" },
  { name: "Rojo Carmín", hex: "#d91e18", hueRotate: "150deg", saturate: "1.5" },
  { name: "Azul Eléctrico", hex: "#1e90ff", hueRotate: "220deg", saturate: "1.2" },
  { name: "Amarillo Giallo", hex: "#ffd700", hueRotate: "60deg", saturate: "1.8" },
  { name: "Verde Ácido", hex: "#32cd32", hueRotate: "100deg", saturate: "1.5" },
  { name: "Morado Místico", hex: "#8a2be2", hueRotate: "280deg", saturate: "1.4" },
];

export default function CarMediaViewer({ imageUrl, brand, model, status }: CarMediaViewerProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

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
    
    // Calculate mouse position relative to center of the element (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Visualizador Principal Interactivo (Sin Botones) */}
      <div 
        className="relative aspect-video rounded-3xl overflow-hidden glass cursor-crosshair shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          <img 
            src={imageUrl} 
            alt={`${brand} ${model}`} 
            className="w-full h-full object-cover scale-110 pointer-events-none transition-all duration-300 ease-in-out"
            style={{ 
              filter: `hue-rotate(${selectedColor.hueRotate}) saturate(${selectedColor.saturate})`
            }}
          />
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

      {/* Selector de Colores Integrado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-panel p-5 rounded-2xl">
        <span className="text-sm text-white/70 tracking-wide uppercase font-medium">
          Color: <span className="text-white ml-2">{selectedColor.name}</span>
        </span>
        <div className="flex gap-4">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ease-out ${
                selectedColor.name === color.name 
                  ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                  : 'border-white/20 hover:scale-110 hover:border-white/50 opacity-70 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: color.hex,
                background: color.hex === '#ffffff' ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' : color.hex
              }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
