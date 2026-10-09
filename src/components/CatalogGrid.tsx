"use client";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import type { Vehiculo } from "@prisma/client";
import { useSessionState } from "@/hooks/useSessionState";
import CarCard from "@/components/CarCard";
interface Props { cars: Vehiculo[]; requestedBrand?: string; requestedType?: string; resetFilters?: boolean; }
export default function CatalogGrid({cars,requestedBrand,requestedType,resetFilters}: Props) {
  const [brands,setBrands] = useSessionState<string[]>('catalog:brands',[]);
  const [types,setTypes] = useSessionState<string[]>('catalog:types',[]);
  const [status,setStatus] = useSessionState('catalog:status','');
  const [page,setPage] = useSessionState('catalog:page',1);
  useEffect(() => { if(resetFilters || requestedBrand || requestedType) {setBrands(requestedBrand ? [requestedBrand] : []);setTypes(requestedType ? [requestedType] : []);setStatus('');setPage(1);} },[resetFilters,requestedBrand,requestedType,setBrands,setTypes,setStatus,setPage]);
  const filtered=cars.filter(car=>(!brands.length || brands.includes(car.marca)) && (!types.length || types.some(t=>t.toLowerCase()===car.tipo.toLowerCase())) && (!status || car.estado===status));
  const pages=Math.max(1,Math.ceil(filtered.length/3));
  const current=Math.min(Math.max(1,page),pages);
  const reset=()=>{setBrands([]);setTypes([]);setStatus('');setPage(1);};
  return <section aria-label="Colección de vehículos">
    <div className="catalog-filters">
      <label>Marca<select value={brands[0] || ''} onChange={e=>{setBrands(e.target.value ? [e.target.value] : []);setPage(1);}}><option value="">Todas las marcas</option>{Array.from(new Set(cars.map(c=>c.marca))).sort().map(b=><option key={b}>{b}</option>)}</select></label>
      <label>Carrocería<select value={types[0]?.toLowerCase() || ''} onChange={e=>{setTypes(e.target.value ? [e.target.value] : []);setPage(1);}}><option value="">Todos los modelos</option>{Array.from(new Set(cars.map(c=>c.tipo.toLowerCase()))).sort().map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></label>
      <label>Disponibilidad<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Todos los estados</option>{Array.from(new Set(cars.map(c=>c.estado))).sort().map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></label>
      <button type="button" onClick={reset}><RotateCcw size={17}/>Limpiar</button>
    </div>
    <div className="flex justify-between items-center gap-4 mb-5"><h2 className="text-xl">Explora la colección</h2><p role="status" className="text-sm text-muted">{filtered.length} {filtered.length === 1 ? "modelo" : "modelos"}</p></div>
    <div className="catalog-cards">{filtered.slice((current-1)*3,current*3).map(car=><CarCard key={car.id} car={car}/>)}</div>
    {filtered.length===0 && <div className="glass rounded-2xl p-10 text-center"><p>No hay vehículos que coincidan con estos filtros.</p><button className="mt-4 underline" onClick={reset}>Ver todos los modelos</button></div>}
    <nav className="catalog-pagination" aria-label="Páginas del catálogo"><p>{filtered.length ? `${(current-1)*3+1}-${Math.min(current*3,filtered.length)}` : '0'} de {filtered.length}</p><div className="flex gap-2"><button type="button" disabled={current===1} onClick={()=>setPage(current-1)}>← Anterior</button><button type="button" disabled={current===pages} onClick={()=>setPage(current+1)}>Siguiente →</button></div></nav>
  </section>;
}
