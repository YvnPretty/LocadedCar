
import Link from "next/link";
import { ArrowRight, ShieldCheck, Gauge, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-[85svh] py-28 sm:py-32 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111]" />

        <div


          className="absolute top-1/4 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px]"
        />
        <div


          className="absolute bottom-1/4 -right-20 w-[28rem] h-[28rem] bg-orange-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto">
        <div



        >
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-medium tracking-[0.32em] text-white/70 mb-6 uppercase">
            <Sparkles size={12} className="text-amber-300" />
            innovación & elegancia
          </span>
        </div>

        <div



          className="mx-auto mb-8 w-full max-w-5xl iphone-shell rounded-[32px] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="rounded-[26px] border border-white/10 bg-black/25 p-4 sm:p-6 md:p-10 backdrop-blur-xl">
            <h1



              className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight mb-6"
            >
              Experimenta la <br className="hidden md:block" />
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                Adrenalina Pura.
              </span>
            </h1>

            <p



              className="text-lg md:text-xl text-white/55 mb-10 font-light max-w-2xl mx-auto"
            >
              Descubre una colección exclusiva de vehículos deportivos y semideportivos. Diseño, potencia y estatus al alcance de tus manos.
            </p>

            <div



              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/catalogo" className="glass-button w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 group">
                Ver Catálogo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/nosotros" className="w-full sm:w-auto px-8 py-4 rounded-full text-white/75 font-medium hover:text-white transition-colors border border-white/10 bg-white/5">
                Conocer más
              </Link>
            </div>
          </div>
        </div>

        <div



          className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-left sm:text-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/70 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-sm">Inventario verificado</span>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/70 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Gauge size={16} className="text-sky-400" />
            <span className="text-sm">Entrega premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
