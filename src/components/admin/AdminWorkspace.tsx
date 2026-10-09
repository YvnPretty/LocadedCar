"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard,Car,Users,Receipt,MessageSquare,ScanLine } from 'lucide-react';
const items=[{href:'/admin',label:'Resumen',icon:LayoutDashboard},{href:'/admin/inventario',label:'Inventario',icon:Car},{href:'/admin/clientes',label:'Clientes',icon:Users},{href:'/admin/ventas',label:'Ventas',icon:Receipt},{href:'/admin/cotizaciones',label:'Cotizaciones',icon:MessageSquare}];
export default function AdminWorkspace({children}:{children:React.ReactNode}) {
 const pathname=usePathname();
 return <div className="admin-workspace"><aside><p className="text-xs text-muted uppercase tracking-widest mb-6">Administración</p><nav aria-label="Navegación administrativa">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}><Icon size={18}/>{label}</Link>)}<Link href="/pos" className="mt-6 border-t border-line pt-6"><ScanLine size={18}/>Abrir POS</Link></nav></aside><main className="min-w-0">{children}</main></div>;
}
