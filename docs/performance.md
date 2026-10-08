# Carga de imágenes

Las fotos incluidas en `public/vehicles` y `public/renders` se convierten a WebP durante `npm run build` (también antes de `npm run dev`). Se generan cinco tamaños: 320, 640, 960, 1280 y 1920 píxeles, sin ampliar los originales.

`scripts/prepare-vehicle-images.mjs` produce los archivos de `public/vehicle-previews` y actualiza `src/lib/vehicle-previews.json`. Los nombres incluyen una huella del contenido y la configuración de conversión; pueden almacenarse durante un año sin mantener una foto antigua cuando cambie el original. Si cambia el algoritmo, aumentar su versión en el script.

El navegador elige el tamaño según la pantalla. La portada y la foto de detalle tienen carga inmediata y prioridad alta; las tarjetas conservan carga diferida. Las fotos externas y las subidas del usuario mantienen el comportamiento anterior.

Para compilar directamente con `next build`, ejecutar primero `npm run images:prepare`. El comando habitual `npm run build` ya incluye este paso.

Validación: compilación de producción y TypeScript correctos, 12 pruebas existentes aprobadas; verificación HTTP de portada, prioridad de imagen y caché, y presencia de las 60 variantes. Los originales suman 3.96 MB; su conjunto de variantes a 640 px suma 393 KB. Esto compara archivos originales, no tiempos de carga ni el optimizador previo de Next.js. No se ha medido una mejora de Lighthouse.
