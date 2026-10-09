import { resolveVehicleImage, type VehicleIdentity } from './vehicle-media';

// Configurable finishes for the demo catalog, not a claim of factory availability.
export const vehiclePalettes = [
  { marca: 'Porsche', modelo: '911 GT3 RS', colors: [['Blanco Ártico', '#f5f5f2'], ['Rojo Carmín', '#c91f32'], ['Azul Racing', '#2463a0'], ['Negro Grafito', '#25282b']] },
  { marca: 'Mercedes-Benz', modelo: 'AMG GT 63', colors: [['Plata Metálico', '#b8bec4'], ['Negro Obsidiana', '#16191c'], ['Azul Noche', '#183a59'], ['Blanco Perla', '#eeeae0']] },
  { marca: 'Ferrari', modelo: 'F8 Tributo', colors: [['Rojo Deportivo', '#d02028'], ['Amarillo Racing', '#f1c40f'], ['Negro Ónix', '#181818'], ['Azul Cobalto', '#2356a8']] },
  { marca: 'Lamborghini', modelo: 'Aventador SVJ', colors: [['Verde Lima', '#84cc16'], ['Naranja Fuego', '#f97316'], ['Amarillo Solar', '#facc15'], ['Negro Grafito', '#25282b']] },
  { marca: 'Bugatti', modelo: 'Chiron', colors: [['Azul Royal', '#2457b2'], ['Blanco Perla', '#eeeae0'], ['Negro Ónix', '#181818'], ['Plata Metálico', '#b8bec4']] },
  { marca: 'Pagani', modelo: 'Huayra Roadster', colors: [['Plata Titanio', '#9ca5ad'], ['Azul Zafiro', '#1d4b82'], ['Rojo Rubí', '#9b2436'], ['Negro Grafito', '#25282b']] },
  { marca: 'Ford', modelo: 'Mustang Shelby GT500', colors: [['Azul Racing', '#2463a0'], ['Rojo Deportivo', '#d02028'], ['Blanco Ártico', '#f5f5f2'], ['Negro Ónix', '#181818']] },
  { marca: 'Chevrolet', modelo: 'Corvette Z06', colors: [['Amarillo Racing', '#f1c40f'], ['Rojo Deportivo', '#d02028'], ['Azul Cobalto', '#2356a8'], ['Blanco Perla', '#eeeae0']] },
];

export type VehicleColor = { nombre: string; hex: string; imagenUrl: string };
export type PaintFinish = 'gloss' | 'satin' | 'matte';
export const paintFinishes: { id: PaintFinish; label: string }[] = [
  { id: 'gloss', label: 'Brillante' }, { id: 'satin', label: 'Satinado' }, { id: 'matte', label: 'Mate' },
];
export function getVehicleColors(car: VehicleIdentity, colors: VehicleColor[] = []): VehicleColor[] {
  if (colors.length) return colors;
  const palette = vehiclePalettes.find(p => p.marca === car.marca && p.modelo === car.modelo);
  const image = resolveVehicleImage(car);
  // Never recolor a user upload with a mask made for a reference photograph.
  if (!image?.startsWith('/vehicles/')) return [];
  return palette?.colors.map(([nombre, hex]) => ({ nombre, hex, imagenUrl: image })) ?? [];
}
export function paintTransfer(hex: string, finish: PaintFinish) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const sheen = finish === 'gloss' ? 1 : finish === 'satin' ? 0.82 : 0.68;
  return [1, 3, 5].map(offset => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return [0, channel * 0.45, channel * 0.85, channel, channel + (1 - channel) * sheen].join(' ');
  });
}
