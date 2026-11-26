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
  if (!channels) return null;
  if (!mask) return <div className="relative h-full w-full bg-white">
    <svg viewBox="0 0 1000 600" className="h-full w-full" role="img" aria-label={`${name}, ${colorName}, simulación aproximada`}>
      <defs>
        <radialGradient id={`${id}-soft`} cx="50%" cy="56%" r="49%">
          <stop offset="0%" stopColor="white"/><stop offset="65%" stopColor="white" stopOpacity=".85"/><stop offset="100%" stopColor="black"/>
        </radialGradient>
        <mask id={`${id}-approx`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600"><ellipse cx="500" cy="340" rx="480" ry="225" fill={`url(#${id}-soft)`}/></mask>
        <filter id={`${id}-color`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncR type="table" tableValues={channels[0]}/><feFuncG type="table" tableValues={channels[1]}/><feFuncB type="table" tableValues={channels[2]}/></feComponentTransfer>
        </filter>
      </defs>
      <image href={src} width="1000" height="600" preserveAspectRatio="xMidYMid meet"/>
      <image href={src} width="1000" height="600" preserveAspectRatio="xMidYMid meet" filter={`url(#${id}-color)`} mask={`url(#${id}-approx)`} opacity=".8"/>
    </svg>
    <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] text-ink">Vista aproximada · {colorName}</span>
  </div>;
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
