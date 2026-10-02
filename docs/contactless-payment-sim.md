# Pagos y recibos de LocadedCar

El sistema registra operaciones de demostración. Tap iPhone no lee NFC, no utiliza Apple Pay ni mueve dinero.

## Iniciar en Linux

```bash
cd ~/Descargas/LocadedCar
npm ci
npm run dev -- --hostname 0.0.0.0
```

Antes de iniciar, `predev` prepara Prisma y el catálogo. Si falta `DATABASE_URL`, reutiliza una base SQLite detectada o crea `.env` con `DATABASE_URL="file:./dev.db"`. Esa ruta corresponde a `prisma/dev.db`. Conserva las variables existentes y los registros; si detecta varias bases, solicita configurar la ruta elegida. No utiliza `--accept-data-loss`.

También puede ejecutar la preparación por separado con `npm run setup`.

## Tap iPhone

1. Abra `/pos`, seleccione una unidad disponible y capture nombre y correo del comprador.
2. Elija **Tap iPhone** y pulse **Registrar venta y emitir recibo**.
3. Abra o copie el enlace del simulador y ábralo en el teléfono, conectado a la misma red.
4. Pulse **Aprobar pago** o **Rechazar**.
5. La aprobación registra la venta y guarda el recibo en una sola transacción. El teléfono muestra el folio; el POS recupera el recibo automáticamente.

En desarrollo, cuando el POS se abre por `localhost`, se usa una dirección IPv4 privada de la computadora para el enlace del teléfono. Puede definirla explícitamente si hay varias interfaces de red:

```env
CONTACTLESS_PUBLIC_BASE_URL=http://192.168.1.100:3000
```

Cambie esa IP por la de su computadora. En producción se utiliza el origen de la solicitud o la URL configurada.

Las sesiones se guardan en SQLite y permanecen después de reiniciar el servidor. Una sesión pendiente vence después de 10 minutos. Puede recargar o salir del POS: la aprobación se procesa en el servidor. Repetir la aprobación devuelve la misma transacción, sin duplicarla. Un rechazo o una expiración no registra una venta.

## Buscar pagos

Abra **Buscar pagos** en el POS, el menú principal o la sección de ventas, o vaya a `/pos/pagos`. Puede buscar por folio, ID de transacción, nombre, correo, teléfono, marca o modelo. El historial tiene paginación, actualización y estados de carga, error y sin resultados. **Ver / imprimir recibo** recupera el comprobante guardado, incluidos método, modalidad y cambio.

Las operaciones antiguas se siguen mostrando. Si no tenían un snapshot del recibo, la interfaz lo indica sin inventar datos del cobro.

El checkout y el POS comparten validaciones de precio. Un anticipo inferior al saldo mantiene el vehículo como `apartado`; una liquidación lo marca como `vendido`. No se almacenan números de tarjeta ni CVV.

## API

- `POST /api/payments/contactless`: recibe la captura completa del POS, valida el importe contra el catálogo y crea una sesión.
- `GET /api/payments/contactless/:id`: consulta estado y recibo cuando existe.
- `POST /api/payments/contactless/:id`: recibe `{ "action": "approve" }` o `{ "action": "decline" }`.
- `GET /api/pos/transaccion?q=texto&page=1`: busca operaciones, 20 por página.
- `POST /api/pos/transaccion`: registra operaciones de mostrador. Tap requiere aprobación desde su sesión.
- `POST /api/checkout`: registra la compra o el apartado web con el importe validado por el servidor.

El panel sigue siendo una demostración sin autenticación productiva. Las consultas de historial pertenecen al área operativa, igual que el panel administrativo existente.
