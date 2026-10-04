export default function Loading() {
  return <div role="status" className="mx-auto w-full max-w-7xl px-4 py-32 text-white/70">
    <p className="mb-6 text-lg">Cargando LocadedCar…</p>
    <div aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[0, 1].map(item => <div key={item} className="h-64 rounded-3xl bg-white/5 animate-pulse" />)}
    </div>
  </div>;
}
