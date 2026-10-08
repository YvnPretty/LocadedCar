# Adaptación de la aplicación a los mockups

Se aplica la paleta marfil, verde y lima al catálogo, ficha, checkout, contacto, POS, administración y comprobantes. El catálogo incorpora el vehículo destacado, filtros de marca/carrocería/estado y paginación de tres unidades. La administración utiliza navegación lateral, indicadores y últimas operaciones obtenidos de Prisma.

Se conservan las APIs existentes y los borradores por pestaña. Los pagos siguen siendo de demostración. Esta actualización de interfaz no añade una integración bancaria, autenticación ni migraciones de datos.

## Unidad 2

[Documento completo](Unidad_2_LocadedCar_Completo.pdf): investigaciones sobre modelos de datos, diagramas de secuencia e interfaces; arquitectura; esquema actual y propuesta de evolución; correspondencia de casos de uso con pantallas; guía de Visual Paradigm; referencias y anexo de mockups.

Los diagramas del PDF son ilustraciones propias. No se generó un proyecto nativo `.vpp` ni se ejecutó Visual Paradigm.

## Verificación

- Compilación de producción de Next.js y TypeScript completadas.
- 12 pruebas existentes aprobadas.
- Revisión de las rutas catálogo, checkout, POS, administración y contacto en Chromium, sin errores de JavaScript.
- Pruebas con SQLite temporal, independiente de la base del despliegue.

El commit actualiza el código del repositorio; la publicación depende del servicio conectado al repositorio.
