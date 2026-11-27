"use client";
import { useId } from 'react';
import Link from 'next/link';
import { paintTransfer, type PaintFinish } from '@/lib/vehicle-colors';
import { vehiclePaintMasks } from '@/lib/vehicle-paint';

export default function VehiclePaintPreview({ src, name, color, colorName, finish }: {
  src: string; name: string; color: string; colorName: string; finish: PaintFinish;
}) {
  const id = useId().replace(/:/g, '');
  const mask = vehiclePaintMasks[src];
  const channels = paintTransfer(color, finish);
  if (!mask || !channels) return null;
  return <div className="relative h-full w-full bg-white">
    <svg viewBox={`0 0 ${mask.width} ${mask.height}`} className="h-full w-full" role="img" aria-label={`${name}, ${colorName}, vista previa de pintura`}>
      <defs>
        <clipPath id={`${id}-outline`}><path d={mask.body}/></clipPath>
        {mask.chroma && <filter id={`${id}-chroma`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${mask.chroma === 'yellow' ? '4 4 -8 0 -0.35' : '6 -3 -3 0 -0.25'}`}/>
        </filter>}
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width={mask.width} height={mask.height}>
          {mask.chroma ? <image href={src} width={mask.width} height={mask.height} filter={`url(#${id}-chroma)`} clipPath={`url(#${id}-outline)`}/> : <><path d={mask.body} fill="white"/><path d={mask.cutouts} fill="black"/></>}
        </mask>
        <filter id={`${id}-paint`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={channels[0]}/><feFuncG type="table" tableValues={channels[1]}/><feFuncB type="table" tableValues={channels[2]}/>
          </feComponentTransfer>
        </filter>
      </defs>
      <image href={src} width={mask.width} height={mask.height}/>
      <image href={src} width={mask.width} height={mask.height} mask={`url(#${id}-body)`} filter={`url(#${id}-paint)`}/>
    </svg>
    <Link href="/creditos-imagenes" className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] text-ink">Foto de referencia · Créditos</Link>
  </div>;
}
