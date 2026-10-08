import Hero from "@/components/Hero";
import CatalogGrid from "@/components/CatalogGrid";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Home() {
 const inventory=await prisma.vehiculo.findMany({orderBy:{createdAt:'asc'}});
 const cars=[...inventory.filter(c=>c.marca==='Audi'),...inventory.filter(c=>c.marca!=='Audi')];
 return <main className="collection-page"><Hero car={cars.find(c=>c.marca==='Audi') || cars[0]}/><CatalogGrid cars={cars}/></main>;
}
