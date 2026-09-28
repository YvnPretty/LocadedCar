/** Reference photos identify a model, not the individual stock unit or its year. */
export const vehicleMedia = [
  { brand: 'Porsche', model: '911 GT3 RS', identity: 'Porsche 911 GT3 RS · 992', file: 'porsche-911-gt3-rs-992.jpg', source: 'Porsche_911_GT3_RS_992.jpg', author: 'Calreyn88', legacy: 'photo-1614162692292-7ac56d7f7f1e' },
  { brand: 'Mercedes-Benz', model: 'AMG GT 63', identity: 'Mercedes-AMG GT 63 · 4 puertas · X290', file: 'mercedes-amg-gt63-x290.jpg', source: 'Mercedes-AMG_GT_63_IMG_2690.jpg', author: 'Alexander Migl', legacy: 'photo-1617531653332-bd46c24f2068' },
  { brand: 'Ferrari', model: 'F8 Tributo', identity: 'Ferrari F8 Tributo · Coupé', file: 'ferrari-f8-tributo.jpg', source: 'Ferrari_F8_Tributo.jpg', author: 'Calreyn88', legacy: 'photo-1592198084033-aade902d1aae' },
  { brand: 'Lamborghini', model: 'Aventador SVJ', identity: 'Lamborghini Aventador LP770-4 SVJ', file: 'lamborghini-aventador-svj.jpg', source: 'Lamborghini_Aventador_SVJ.jpg', author: 'MrWalkr', legacy: 'photo-1583121274602-3e2820c69888' },
  { brand: 'Bugatti', model: 'Chiron', identity: 'Bugatti Chiron', file: 'bugatti-chiron.jpg', source: 'A_Bugatti_Chiron.jpg', author: 'MrWalkr', legacy: 'photo-1600712242805-5f78671b24da' },
  { brand: 'Pagani', model: 'Huayra Roadster', identity: 'Pagani Huayra Roadster', file: 'pagani-huayra-roadster.jpg', source: 'Pagani_Huayra_Roadster.jpg', author: 'Y.Leclercq©', legacy: 'photo-1603584173870-7f23fdae1b7a' },
  { brand: 'Ford', model: 'Mustang Shelby GT500', identity: 'Ford Mustang Shelby GT500 · S550', file: 'ford-mustang-shelby-gt500-s550.jpg', source: '2020_Ford_Mustang_Shelby_GT500_GT101.jpg', author: 'MrWalkr', legacy: 'photo-1547038577-d7ff7d353aef' },
  { brand: 'Chevrolet', model: 'Corvette Z06', identity: 'Chevrolet Corvette Z06 · C8', file: 'chevrolet-corvette-z06-c8.jpg', source: '2023_Corvette_Z06.jpg', author: 'Schoolerhavefun', legacy: 'photo-1552519507-da3b142c6e3d' },
] as const;
export type VehicleIdentity = { marca: string; modelo: string; anio?: number; imagenUrl?: string | null };
const normalize = (value: string) => value.trim().toLowerCase();
export function getVehicleReference(car: VehicleIdentity) {
  return vehicleMedia.find(item => normalize(item.brand) === normalize(car.marca) && normalize(item.model) === normalize(car.modelo));
}
export function vehicleName(car: VehicleIdentity) {
  return getVehicleReference(car)?.identity ?? `${car.marca} ${car.modelo}`;
}
export function resolveVehicleImage(car: VehicleIdentity, override?: string | null) {
  const supplied = override ?? car.imagenUrl;
  const ref = getVehicleReference(car);
  // Only replace known demo URLs. Preserve images explicitly uploaded for an actual unit.
  const isLegacy = !!supplied && (vehicleMedia.some(item => supplied.includes(item.legacy)) || supplied.includes('photo-1492144534655-ae79c964c9d7'));
  const wrongAudiFallback = !!supplied?.startsWith('/renders/audi_r8_') && (normalize(car.marca) !== 'audi' || !normalize(car.modelo).startsWith('r8 '));
  if (!supplied || isLegacy || wrongAudiFallback) return ref ? `/vehicles/${ref.file}` : null;
  return supplied;
}
export function isReferenceImage(car: VehicleIdentity, src: string | null) {
  return !!src && src === `/vehicles/${getVehicleReference(car)?.file}`;
}
