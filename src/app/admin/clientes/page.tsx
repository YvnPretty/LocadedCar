import { PrismaClient } from "@prisma/client";
import { UserPlus, Mail, Phone } from "lucide-react";

const prisma = new PrismaClient();

export default async function AdminClientes() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-white">Gestión de Clientes (CRM)</h1>
          <p className="text-white/50">Administra los prospectos y su información de contacto.</p>
        </div>
        <button className="glass-button px-4 py-2 rounded-xl text-white flex items-center gap-2">
          <UserPlus size={18} /> Nuevo Prospecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientes.length === 0 ? (
          <div className="col-span-full text-center py-12 glass rounded-2xl">
            <p className="text-white/50">Aún no hay clientes registrados en la base de datos.</p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} className="glass p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-medium text-white">{cliente.nombre}</h3>
                <p className="text-sm text-white/40">Registrado el: {cliente.createdAt.toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-white/70">
                  <Mail size={16} className="text-white/40" />
                  <a href={`mailto:${cliente.correo}`} className="hover:text-white transition-colors">{cliente.correo}</a>
                </div>
                {cliente.telefono && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone size={16} className="text-white/40" />
                    <a href={`tel:${cliente.telefono}`} className="hover:text-white transition-colors">{cliente.telefono}</a>
                  </div>
                )}
              </div>
              
              <button className="mt-2 glass-button py-2 rounded-xl text-white text-sm font-medium">
                Generar Cotización
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
