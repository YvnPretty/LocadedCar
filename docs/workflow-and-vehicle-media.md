# Continuidad de navegación y fotografías

- Los borradores usan `sessionStorage` por pestaña, con versión y caducidad de ocho horas. Se restauran al volver o recargar. Si el almacenamiento está bloqueado, se conserva el estado en memoria mientras vive la aplicación.
- Compra: vehículo, datos del comprador, modalidad, método, plazo y paso. Los números de tarjeta y CVV nunca se guardan. Antes de finalizar se vuelven a validar los pasos.
- POS: vehículo, comprador y parámetros de venta; el precio y la disponibilidad se consultan desde el inventario actual, no desde el borrador.
- Catálogo: filtros y última ficha visitada. Inventario: filtros y captura de alta. Contacto: formulario. Color: compartido entre ficha y compra para el mismo modelo.
- La navegación ofrece Continuar; Nueva venta / Empezar de nuevo descartan la captura tras confirmación. Las operaciones exitosas limpian el borrador correspondiente.
- `vehicle-media.ts` relaciona cada foto de referencia con marca, versión y generación. Se conservan las fotos personalizadas. Los errores de carga presentan Foto pendiente, nunca la imagen de otro vehículo.
- Las fotografías están en `public/vehicles` y sus atribuciones en `/creditos-imagenes`. No identifican el VIN ni acreditan el año de una unidad concreta.
- El seed repara exclusivamente URLs iniciales conocidas y fotos vacías, también en bases existentes. No modifica precios, clientes, ventas ni fotografías personalizadas.

## Verificación

`npm test` cubre restauración de borradores al desmontar/montar e hidratar, caducidad, datos corruptos, limpieza, correspondencias de fotos y validación de importes.

Para una prueba visual: elegir un vehículo, completar datos, avanzar a Pago, visitar Contacto y pulsar Continuar; comprobar vehículo, color, comprador y paso. Repetir entre POS e Inventario, y recargar. Confirmar que una venta finalizada no deja un borrador activo.

Los borradores son locales a la pestaña; la sincronización entre dispositivos requiere persistencia de servidor ligada a una sesión autenticada.
