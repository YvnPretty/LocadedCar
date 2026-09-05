"use client";

import { useState } from "react";
import Car3DViewer from "./Car3DViewer";
import { Box, Image as ImageIcon } from "lucide-react";

interface CarMediaViewerProps {
  imageUrl: string;
  brand: string;
  model: string;
  status: string;
}

const COLORS = [
  { name: "Rojo Carmín", hex: "#d91e18" },
  { name: "Azul Eléctrico", hex: "#1e90ff" },
  { name: "Negro Obsidiana", hex: "#111111" },
  { name: "Blanco Perla", hex: "#f0f0f0" },
  { name: "Plata Metálico", hex: "#aaaaaa" },
  { name: "Amarillo Giallo", hex: "#ffd700" },
];

export default function CarMediaViewer({ imageUrl, brand, model, status }: CarMediaViewerProps) {
  const [is3DMode, setIs3DMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Visualizador Principal */}
      <div className="relative aspect-video rounded-3xl overflow-hidden glass">
        {is3DMode ? (
          <Car3DViewer color={selectedColor.hex} />
        ) : (
          <img 
            src={imageUrl} 
            alt={`${brand} ${model}`} 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Etiqueta de Estado */}
        <div className="absolute top-4 right-4 pointer-events-none z-10">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
            status === 'disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Controles: Toggle 2D/3D y Colores */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-panel p-4 rounded-2xl">
        
        {/* Toggle 2D/3D */}
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setIs3DMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!is3DMode ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            <ImageIcon size={16} />
            Foto
          </button>
          <button 
            onClick={() => setIs3DMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${is3DMode ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            <Box size={16} />
            Visor 3D
          </button>
        </div>

        {/* Selector de Colores (Solo visible en 3D) */}
        {is3DMode && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">Pintura: <span className="text-white font-medium">{selectedColor.name}</span></span>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor.hex === color.hex ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
