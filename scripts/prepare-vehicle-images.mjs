import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Generate once at build time, rather than resize on the first visitor's request.
const root = process.cwd();
const output = path.join(root, 'public/vehicle-previews');
const widths = [320, 640, 960, 1280, 1920];
const quality = 75;
const images = {};
let originalBytes = 0;
let previewBytes = 0;
await mkdir(output, { recursive: true });
for (const directory of ['vehicles', 'renders']) {
  for (const file of (await readdir(path.join(root, 'public', directory))).sort()) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const source = await readFile(path.join(root, 'public', directory, file));
    const hash = createHash('sha256').update(source).update(`webp:${quality}:v1`).digest('hex').slice(0, 16);
    const prefix = `/vehicle-previews/${hash}`;
    images[`/${directory}/${file}`] = prefix;
    originalBytes += source.length;
    for (const width of widths) {
      const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
      await writeFile(path.join(root, 'public', `${prefix}-${width}.webp`), result);
      if (width === 640) previewBytes += result.length;
    }
  }
}
await writeFile(path.join(root, 'src/lib/vehicle-previews.json'), JSON.stringify({ widths, images }, null, 2) + '\n');
console.log(`Vehicle previews: ${Object.keys(images).length} images; originals ${originalBytes} B; 640px WebP ${previewBytes} B.`);
