"use client";

import { useState } from 'react';
import { Check, Palette, RotateCcw } from 'lucide-react';
import VehicleImage from '@/components/VehicleImage';
import VehiclePaintPreview from '@/components/VehiclePaintPreview';
import { useSessionReady, useSessionState } from '@/hooks/useSessionState';
import { getVehicleColors, paintFinishes, type PaintFinish, type VehicleColor } from '@/lib/vehicle-colors';
import { resolveVehicleImage } from '@/lib/vehicle-media';
import { vehiclePaintMasks } from '@/lib/vehicle-paint';

interface CarMediaViewerProps {
  vehicleId: string; imageUrl: string; brand: string; model: string; status: string; dbColors?: VehicleColor[];
}

export default function CarMediaViewer({ vehicleId, imageUrl, brand, model, status, dbColors = [] }: CarMediaViewerProps) {
  const ready = useSessionReady();
  const car = { marca: brand, modelo: model, imagenUrl: imageUrl };
  const colors = getVehicleColors(car, dbColors);
  const [selectedName, setSelectedName] = useSessionState(`vehicle:${vehicleId}:color`, '');
  const [savedFinish, setFinish] = useSessionState<PaintFinish>(`vehicle:${vehicleId}:finish`, 'gloss');
  const finish = paintFinishes.some(item => item.id === savedFinish) ? savedFinish : 'gloss';
  const [showOriginal, setShowOriginal] = useState(false);
  const selected = colors.find(color => color.nombre === selectedName);
  const src = resolveVehicleImage(car, selected?.imagenUrl || imageUrl);
  const canPreview = !!src && !!vehiclePaintMasks[src];
  const preview = canPreview && !!selected && !showOriginal;

  return <section className="vehicle-configurator" aria-label="Imágenes y pintura del vehículo">
    <div className="vehicle-stage">
      <div className="vehicle-stage-bar"><span><span className={`status-dot ${status === 'disponible' ? 'is-available' : ''}`}/>{status}</span><span>{preview ? 'Vista previa de pintura' : 'Fotografía del modelo'}</span></div>
      <div className="vehicle-stage-image">
        {preview ? <VehiclePaintPreview src={src!} name={`${brand} ${model}`} color={selected.hex} colorName={selected.nombre} finish={finish}/> : <VehicleImage car={car} src={showOriginal ? imageUrl : src} className="h-full w-full" showCredit eager/>}
      </div>
      <div className="vehicle-stage-footer"><span>{brand} <strong>{model}</strong></span>{selected && <button type="button" aria-pressed={showOriginal} onClick={() => setShowOriginal(!showOriginal)}>{showOriginal ? 'Ver selección' : 'Comparar con original'}</button>}</div>
    </div>
    {colors.length > 0 ? <div className="paint-panel">
      <div className="paint-heading"><div><p className="eyebrow"><Palette size={14}/> Personaliza tu estilo</p><h2 aria-live="polite">{selected?.nombre ?? 'Color original'}</h2></div>{selected && <button type="button" className="paint-reset" aria-label="Restablecer pintura original" onClick={() => { setSelectedName(''); setFinish('gloss'); setShowOriginal(false); }}><RotateCcw size={16}/></button>}</div>
      <div className="paint-colors" role="group" aria-label="Color de carrocería">
        {colors.map(color => <button type="button" disabled={!ready} key={color.nombre} aria-pressed={selected?.nombre === color.nombre} onClick={() => { setSelectedName(color.nombre); setShowOriginal(false); }} className="paint-option">
          <span className="paint-swatch" style={{ backgroundColor: color.hex }}>{selected?.nombre === color.nombre && <Check size={16} className="paint-check"/>}</span><span>{color.nombre}</span>
        </button>)}
      </div>
      {canPreview && <fieldset className="paint-finishes"><legend>Acabado de pintura</legend><div>{paintFinishes.map(item => <button key={item.id} type="button" disabled={!selected} aria-pressed={finish === item.id} onClick={() => { setFinish(item.id); setShowOriginal(false); }}>{item.label}</button>)}</div></fieldset>}
      <p className="paint-note">{canPreview ? 'Simulación visual sobre una foto de referencia. Confirma los colores y acabados disponibles con un asesor.' : 'Consulta la disponibilidad del color con un asesor.'}</p>
    </div> : <p className="paint-note">Consulta con un asesor los colores disponibles para esta unidad.</p>}
  </section>;
}
