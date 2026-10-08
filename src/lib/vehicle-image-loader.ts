import type { ImageLoaderProps } from 'next/image';
import previews from './vehicle-previews.json';

const images: Record<string, string> = previews.images;

export function hasVehiclePreview(src: string) {
  return Object.hasOwn(images, src);
}

export function vehicleImageLoader({ src, width }: ImageLoaderProps) {
  const prefix = images[src];
  if (!prefix) return src;
  const size = previews.widths.find(candidate => candidate >= width) ?? previews.widths[previews.widths.length - 1];
  return `${prefix}-${size}.webp`;
}
