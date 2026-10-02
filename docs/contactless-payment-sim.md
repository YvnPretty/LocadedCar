# Pago sin contacto simulado (iPhone)

LocadedCar incluye un flujo de demostración para simular **Tap to Pay** sin leer tarjetas reales ni mover dinero.

## Flujo

1. En `/pos`, seleccione vehículo y comprador.
2. En **Método de Cobro en Terminal**, elija **Tap iPhone**.
3. Pulse **Registrar venta y emitir recibo**.
4. El POS crea una sesión temporal con estado `pending` y muestra una URL.
5. Abra esa URL desde el iPhone.
6. En el iPhone pulse **Aprobar pago** o **Rechazar**.
7. El POS consulta la sesión automáticamente.
8. Solo cuando el estado cambia a `approved`, se llama a `/api/pos/transaccion` y se registra la venta real del sistema.

## Uso en red local

El servidor debe ser accesible desde el iPhone:

```bash
npm run dev -- --hostname 0.0.0.0
```

En `.env`, configure la IP LAN de la computadora:

```env
CONTACTLESS_PUBLIC_BASE_URL=http://192.168.1.100:3000
```

Cambie `192.168.1.100` por la IP local de la computadora. El iPhone y la computadora deben estar en la misma red.

## Endpoints

- `POST /api/payments/contactless`: crea una sesión temporal.
- `GET /api/payments/contactless/:id`: consulta el estado.
- `POST /api/payments/contactless/:id`: aprueba o rechaza la sesión.
- `/tap/:id`: interfaz móvil para confirmar el pago.

## Alcance

La sesión se mantiene en memoria y expira después de 10 minutos. Está diseñada únicamente para demostraciones locales o académicas. No procesa Apple Pay, NFC bancario ni tarjetas reales.
