"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function POSClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Mexico_City",
    }));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
    <Clock size={13} className="text-cyan-400" /><span>{time || "--:--:--"}</span><span className="text-neutral-500">CDMX</span>
  </div>;
}
