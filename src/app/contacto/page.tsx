import { Phone, Mail, MapPin } from "lucide-react";

export default function Contacto() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
            Agendar <span className="font-semibold">Cita</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Ponte en contacto con nuestro equipo de ventas para agendar una prueba de manejo o solicitar más información sobre tu próximo deportivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Formulario */}
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-2xl font-medium text-white mb-6">Déjanos tus datos</h3>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-2">Nombre Completo</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Correo Electrónico</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="juan@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Teléfono</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Tu número de contacto" />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Mensaje o Auto de Interés</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Me interesa agendar una cita para..."></textarea>
              </div>
              <button type="button" className="glass-button w-full py-4 rounded-xl text-white font-medium mt-4">
                Enviar Solicitud
              </button>
            </form>
          </div>

          {/* Info de Contacto */}
          <div className="flex flex-col justify-center gap-8">
            <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-full">
                <Phone className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-1">Llámanos</h4>
                <p className="text-white/60">Atención directa para ventas.</p>
                <a href="tel:5539703291" className="text-xl font-semibold text-white mt-2 inline-block">55 3970 3291</a>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-full">
                <Mail className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-1">Correo</h4>
                <p className="text-white/60">Envíanos tus documentos o dudas.</p>
                <a href="mailto:ventas@locadedcar.com" className="text-lg font-medium text-white mt-2 inline-block">ventas@locadedcar.com</a>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-full">
                <MapPin className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-1">Showroom</h4>
                <p className="text-white/60">Agenda tu cita para visitarnos físicamente.</p>
                <p className="text-lg font-medium text-white mt-2">Ciudad de México, MX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
