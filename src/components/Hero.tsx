"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Gauge, Sparkles, MoveDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[94vh] flex items-center overflow-hidden border-b border-white/[0.06]">
      <div className="absolute inset-0 premium-grid opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_38%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.10),transparent_25%)]" />
      <motion.div animate={{ opacity:[.2,.45,.2], scale:[1,1.08,1] }} transition={{duration:9,repeat:Infinity}} className="absolute right-[-8%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-white/[0.035] blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-16 items-end">
          <div>
            <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.7}} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[10px] uppercase tracking-[.3em] text-white/60 mb-8">
              <Sparkles size={12} className="text-amber-300" /> Curaduría automotriz · México
            </motion.div>

            <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.08}} className="text-[clamp(3.7rem,9vw,8.5rem)] leading-[.82] tracking-[-.065em] font-semibold text-white">
              Ingeniería
              <span className="block font-light text-white/42">que se conduce.</span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.2}} className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-white/52">
              Una selección de deportivos y exóticos con una experiencia digital diseñada alrededor del automóvil.
            </motion.p>

            <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.3}} className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/catalogo" className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90">
                Explorar colección <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link href="/contacto" className="glass-button inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm text-white/80">Agendar experiencia</Link>
            </motion.div>
          </div>

          <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.18}} className="lg:pb-2">
            <div className="glass rounded-[2rem] p-3">
              <div className="rounded-[1.45rem] border border-white/[0.08] bg-black/35 p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div><p className="text-[10px] uppercase tracking-[.28em] text-white/35">Locaded Selection</p><p className="mt-1 text-lg font-medium">Performance Collection</p></div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.8)]" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-5">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><ShieldCheck size={18} className="text-emerald-300"/><p className="mt-5 text-sm font-medium">Inventario verificado</p><p className="mt-1 text-xs text-white/35">Selección y control de unidad</p></div>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><Gauge size={18} className="text-amber-300"/><p className="mt-5 text-sm font-medium">Alto rendimiento</p><p className="mt-1 text-xs text-white/35">Máquinas extraordinarias</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-16 flex items-center gap-3 text-[10px] uppercase tracking-[.28em] text-white/30"><MoveDown size={14}/> Descubre la colección</div>
      </div>
    </section>
  );
}
