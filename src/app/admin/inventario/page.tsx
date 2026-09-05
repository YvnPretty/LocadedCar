import { PrismaClient } from "@prisma/client";
import { Plus, Edit2, Trash2 } from "lucide-react";

const prisma = new PrismaClient();

export default async function AdminInventario() {
  const cars = await prisma.vehiculo.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-white">Inventario de Autos</h1>
          <p className="text-white/50">Gestiona los vehículos disponibles en el catálogo.</p>
        </div>
        <button className="glass-button px-4 py-2 rounded-xl text-white flex items-center gap-2">
          <Plus size={18} /> Nuevo Auto
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-white/70">Vehículo</th>
              <th className="px-6 py-4 text-sm font-medium text-white/70">Precio (MXN)</th>
              <th className="px-6 py-4 text-sm font-medium text-white/70">Estado</th>
              <th className="px-6 py-4 text-sm font-medium text-white/70">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={car.imagenUrl || ""} alt="Car" className="w-16 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="font-medium text-white">{car.marca}</p>
                      <p className="text-sm text-white/50">{car.modelo} • {car.anio}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(car.precio)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    car.estado === "disponible" 
                      ? "bg-green-500/20 text-green-300" 
                      : "bg-red-500/20 text-red-300"
                  }`}>
                    {car.estado.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
