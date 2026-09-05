import Link from "next/link";
import { Car, Users, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col pt-24 px-4 pb-6">
        <div className="flex-1 space-y-2">
          <Link href="/admin/inventario" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Car size={18} />
            <span className="font-medium">Inventario</span>
          </Link>
          <Link href="/admin/clientes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Users size={18} />
            <span className="font-medium">Clientes (CRM)</span>
          </Link>
          <Link href="/admin/cotizaciones" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <LayoutDashboard size={18} />
            <span className="font-medium">Cotizaciones</span>
          </Link>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto">
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 px-8 pb-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
