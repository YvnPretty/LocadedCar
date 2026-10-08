import Hero from "@/components/Hero";
import CatalogGrid from "@/components/CatalogGrid";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Catalogo({searchParams}:{searchParams:Promise<{marca?:string;tipo?:string;todos?:string}>}) {
 const filters=await searchParams;
 const inventory=await prisma.vehiculo.findMany({orderBy:{createdAt:'asc'}});
 const cars=[...inventory.filter(c=>c.marca==='Audi'),...inventory.filter(c=>c.marca!=='Audi')];
 return <main className="collection-page"><Hero car={cars.find(c=>c.marca==='Audi') || cars[0]}/><CatalogGrid key={`${filters.marca}-${filters.tipo}-${filters.todos}`} cars={cars} requestedBrand={filters.marca} requestedType={filters.tipo} resetFilters={filters.todos==='1'}/></main>;
}
