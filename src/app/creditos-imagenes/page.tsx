import { vehicleMedia } from '@/lib/vehicle-media';
export default function ImageCredits() {
  return <main className="mx-auto max-w-4xl px-6 pb-20 pt-32 text-white">
    <h1 className="mb-4 text-3xl font-semibold">Fotografías del catálogo</h1>
    <p className="mb-8 text-neutral-300">Las fotografías de referencia corresponden al modelo indicado. No acreditan el año, color, equipamiento ni estado de una unidad concreta. El año mostrado pertenece al registro de inventario. Las variantes del Audi son ilustraciones de configuración del proyecto.</p>
    <ul className="space-y-6">{vehicleMedia.map(item => <li key={item.file} className="rounded-xl border border-white/15 p-4">
      <h2 className="font-semibold">{item.identity}</h2>
      <p>Autor: {item.author} · Wikimedia Commons</p>
      <a className="underline" href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.source)}`}>Fotografía original</a>{' · '}
      <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      <p className="text-sm text-neutral-400">Copia de la imagen de referencia a resolución reducida; sin modificar el vehículo.</p>
    </li>)}</ul>
  </main>;
}
