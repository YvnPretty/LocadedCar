# LocadedCar 🏎️
### *Plataforma Premium de Exhibición, Catálogo y Adquisición de Vehículos Deportivos de Alta Gama*

<p align="center">
  <img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2000&auto=format&fit=crop" alt="LocadedCar Banner" width="100%" style="border-radius: 16px;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-5.22.0-2d3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js" alt="Three.js" />
</p>

---

## 🌟 Descripción General

**LocadedCar** es una plataforma web de última generación concebida para la exhibición inmersiva, gestión comercial y adquisición de vehículos deportivos y exóticos (Porsche, Ferrari, Lamborghini, Bugatti, Mercedes-AMG). 

El sistema implementa una sofisticada estética **Apple-style / Liquid Glass** (*Glassmorphism* con efectos translúcidos `backdrop-blur`), animaciones fluidas con **Framer Motion**, renderizado en servidor de alto rendimiento con **Next.js 16 (App Router + Turbopack)** y persistencia relacional con **Prisma ORM**.

---

## ✨ Características Principales

* 🏎️ **Catálogo Exclusivo Dinámico:** Filtrado reactivo por carrocería (*deportivo / semideportivo*), estado de disponibilidad en tiempo real y formateo de divisas oficial `Intl` en Pesos Mexicanos (MXN).
* 🎨 **Ficha Técnica & Visualizador 3D:** Vista de detalle interactiva (`/catalogo/[id]`) con selector cromático reactivo por paletas HEX y visualizador multimedia interactivo con Three.js / React Three Fiber.
* 💳 **Flujo Completo de Checkout & Pago Seguro (`/checkout`):**
  * **Stepper guiado en 3 pasos:** Datos del titular y entrega blindada ➔ Selección de pago seguro ➔ Revisión y confirmación.
  * **Modalidades de compra:** Liquidación de Contado (100%) o Apartado de Chasis (10% de anticipo para congelar la unidad).
  * **Métodos soportados:** Tarjeta bancaria (con simulación interactiva *Black Card*), transferencia interbancaria SPEI VIP directa y financiamiento a 12, 24 y 36 meses.
  * **Comprobante Digital:** Generación de folio oficial de transacción, bloqueo inmediato del chasis a estado `vendido` y recibo imprimible.
* 🛡️ **Panel Administrativo Integral:**
  * **Inventario (`/admin/inventario`):** Control CRUD completo de stock vehicular con actualización instantánea.
  * **CRM de Clientes (`/admin/clientes`):** Registro de prospectos y compradores con enlaces directos `mailto`/`tel` y emisión de cotizaciones.
* 📱 **Arquitectura 100% Responsiva:** Adaptación impecable en dispositivos móviles, tablets y pantallas de ultra-alta resolución.

---

## 📊 Modelo Relacional de Base de Datos

La arquitectura de datos está normalizada en Tercera Forma Normal (3NF), garantizando atomicidad transaccional e integridad referencial:

```mermaid
erDiagram
    VEHICULO {
        String id PK "UUID v4"
        String marca
        String modelo
        Int anio
        Float precio
        String tipo "deportivo | semideportivo"
        String estado "disponible | vendido"
        String imagenUrl
        String detalles
        DateTime createdAt
        DateTime updatedAt
    }
    
    COLOR_VARIANTE {
        String id PK "UUID v4"
        String nombre
        String hex
        String imagenUrl
        String vehiculoId FK
    }

    CLIENTE {
        String id PK "UUID v4"
        String nombre
        String correo UK
        String telefono
        DateTime createdAt
        DateTime updatedAt
    }
    
    VENDEDOR {
        String id PK "UUID v4"
        String nombre
        String usuario UK
        String contrasena
        DateTime createdAt
        DateTime updatedAt
    }
    
    TRANSACCION {
        String id PK "UUID v4 (Folio)"
        DateTime fecha
        Float montoTotal
        String vehiculoId FK
        String clienteId FK
        String vendedorId FK
    }
    
    VEHICULO ||--o{ COLOR_VARIANTE : "posee (Cascade Delete)"
    VEHICULO ||--o{ TRANSACCION : "es objeto de"
    CLIENTE ||--o{ TRANSACCION : "realiza compra"
    VENDEDOR ||--o{ TRANSACCION : "gestiona y valida"
```

> 📄 **Documentación Detallada:** Consulta la especificación técnica completa y diccionario de datos en [`docs/Modelos_Relacionales_BD_LocadedCar.pdf`](docs/Modelos_Relacionales_BD_LocadedCar.pdf).

---

## 📋 Matriz de Trazabilidad de Requisitos (ISO 21500 / PMBOK)

El desarrollo del proyecto se rige bajo la matriz de trazabilidad estándar:

| ID | Requisito | Tipo | Prio | Estado | Entregable Asociado | Validación |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **RF-01** | Catálogo interactivo | Funcional | Alta | Activo | `/catalogo` (`CatalogGrid.tsx`, `CarCard.tsx`) | Aceptado |
| **RF-02** | Ficha de detalle y selector de color | Funcional | Alta | Activo | `/catalogo/[id]` (`CarMediaViewer.tsx`) | Aceptado |
| **RF-03** | Panel administrativo CRUD de inventario | Funcional | Alta | Activo | `/admin/inventario` (`page.tsx`) | Aceptado |
| **RF-04** | Módulo CRM de administración de clientes | Funcional | Media | Activo | `/admin/clientes` (`page.tsx`) | Aceptado |
| **RF-05** | Formulario de contacto y cotización VIP | Funcional | Media | Activo | `/contacto` (`page.tsx`) | Aceptado |
| **RF-06** | Flujo completo de checkout y pago seguro | Funcional | Alta | Activo | `/checkout` (`CheckoutClient.tsx`, `/api/checkout`) | Aceptado |
| **RT-01** | Base de datos relacional y modelo ORM | No Funcional | Alta | Activo | `prisma/schema.prisma`, `seed.ts` | Aceptado |
| **RT-02** | Arquitectura Next.js 16 y compilación | No Funcional | Alta | Activo | `next.config.ts`, `tsconfig.json` | Aceptado |
| **RNF-01**| Sistema de diseño Glassmorphism y UX | No Funcional | Alta | Activo | `globals.css`, `Navbar.tsx`, `Hero.tsx` | Aceptado |
| **RNF-02**| Control transaccional y consistencia contable | No Funcional | Media | Activo | Modelo `Transaccion` & API Handler | Aceptado |

> 📁 Archivos oficiales disponibles en:
> * 📄 [Matriz de Trazabilidad en PDF (`docs/matriz_trazabilidad_requisitos_llenada.pdf`)](docs/matriz_trazabilidad_requisitos_llenada.pdf)
> * 📊 [Matriz de Trazabilidad en CSV para Excel (`docs/matriz_trazabilidad_requisitos.csv`)](docs/matriz_trazabilidad_requisitos.csv)

---

## 🧭 Análisis y Diseño del Proyecto

### Análisis de los requisitos del proyecto propuesto

El análisis inició con la identificación del problema operativo de una agencia de vehículos de alta gama: exhibir unidades de forma atractiva, evitar la venta duplicada, registrar clientes y mantener control sobre inventario, pagos y ventas. A partir de este problema se identificaron los actores, procesos y restricciones del negocio:

| Elemento | Resultado del análisis |
| :--- | :--- |
| Actores | Cliente comprador, asesor/cajero POS y administrador/gerente |
| Procesos principales | Consultar catálogo, revisar una unidad, cotizar, apartar o comprar, registrar cliente y auditar la venta |
| Información crítica | Vehículos, variantes de color, clientes, vendedores y transacciones |
| Reglas de negocio | Una unidad no debe venderse dos veces; una venta debe asociar vehículo, cliente y vendedor; el estado del inventario debe actualizarse después de la operación |
| Restricciones | Interfaz responsive, moneda MXN, separación de roles, persistencia relacional y comprobante de operación |

Los requisitos se clasificaron en funcionales y no funcionales, se priorizaron por impacto comercial y se vincularon con una vista, componente, API o modelo de datos. La [matriz de trazabilidad](docs/matriz_trazabilidad_requisitos.csv) concentra esa relación y permite verificar que cada requisito tenga un entregable y un criterio de validación.

### Delimitación del alcance del sistema

**Dentro del alcance:**

- Portal público para presentar la marca, consultar el catálogo, filtrar vehículos y revisar fichas técnicas.
- Flujo de checkout con selección de modalidad, datos del comprador, método de pago simulado y comprobante digital.
- Terminal POS para selección de unidades, alta de clientes, cobro multimodal simulado, emisión de ticket y corte de turno.
- Portal administrativo separado para dashboard, inventario, CRM, cotizaciones y auditoría de ventas.
- Persistencia con Prisma y SQLite en desarrollo, con posibilidad de migración a una base administrada en producción.
- Diseño responsive para cliente, administrador y POS.

**Fuera del alcance de esta versión:**

- Cobros bancarios reales, conexión con adquirentes, SPEI o proveedores financieros.
- Facturación fiscal electrónica, validación oficial de RFC y firma contractual con validez legal.
- Gestión de usuarios con autenticación, permisos por cuenta y recuperación de contraseña.
- Logística de entrega, seguimiento GPS, seguros y comunicación automática por WhatsApp.
- Integración con inventarios externos, ERP, CRM de terceros o fuentes oficiales de vehículos.

Esta delimitación evita presentar como implementadas capacidades que requieren proveedores, certificaciones o infraestructura adicional.

### Modelo de casos de uso

El modelo de casos de uso representa las interacciones principales entre los actores y el sistema:

```mermaid
flowchart LR
  Cliente[Cliente comprador] --> Catalogo[Consultar catálogo]
  Cliente --> Detalle[Consultar ficha del vehículo]
  Cliente --> Checkout[Realizar apartado o compra]
  Cliente --> Cita[Solicitar cita o cotización]

  Cajero[Asesor / Cajero POS] --> VentaPOS[Procesar venta en POS]
  Cajero --> ClientePOS[Registrar cliente]
  Cajero --> Ticket[Emitir ticket y comprobante]
  Cajero --> Corte[Consultar corte de turno]

  Admin[Administrador / Gerente] --> Inventario[Administrar inventario]
  Admin --> CRM[Consultar clientes y LTV]
  Admin --> Auditoria[Consultar auditoría de ventas]
  Admin --> KPIs[Consultar indicadores ejecutivos]

  Checkout --> Persistencia[(Base de datos)]
  VentaPOS --> Persistencia
  Inventario --> Persistencia
  Auditoria --> Persistencia
```

El diagrama permite comprobar que el portal público, la operación de mostrador y la supervisión gerencial son fronteras distintas, aunque comparten la información transaccional necesaria.

### Modelo del dominio

El dominio se construyó alrededor de la unidad vehicular y su ciclo comercial. `Vehiculo` es el agregado central; `ColorVariante` describe sus configuraciones, `Cliente` representa al comprador y `Vendedor` al responsable de la operación. `Transaccion` relaciona a los tres y conserva el importe, la fecha y la trazabilidad de la venta.

```mermaid
erDiagram
  VEHICULO ||--o{ COLOR_VARIANTE : tiene
  VEHICULO ||--o{ TRANSACCION : participa
  CLIENTE ||--o{ TRANSACCION : realiza
  VENDEDOR ||--o{ TRANSACCION : gestiona

  VEHICULO {
    String id PK
    String marca
    String modelo
    Int anio
    Float precio
    String estado
  }
  COLOR_VARIANTE {
    String id PK
    String nombre
    String hex
    String vehiculoId FK
  }
  CLIENTE {
    String id PK
    String nombre
    String correo UK
    String telefono
  }
  VENDEDOR {
    String id PK
    String nombre
    String usuario UK
  }
  TRANSACCION {
    String id PK
    DateTime fecha
    Float montoTotal
    String vehiculoId FK
    String clienteId FK
    String vendedorId FK
  }
```

Este modelo permite aplicar una regla esencial del negocio: cada transacción identifica la unidad, el comprador y el responsable que la autorizó. Las operaciones de checkout y POS actualizan el estado del vehículo dentro del proceso transaccional.

### Estudio de factibilidad técnica y operativa

| Dimensión | Evaluación | Justificación |
| :--- | :--- | :--- |
| Técnica | Favorable | Next.js, TypeScript, Prisma y SQLite permiten construir, probar y desplegar el sistema con herramientas conocidas y una arquitectura modular. Railway ofrece ejecución del servidor y despliegue continuo desde GitHub. |
| Operativa | Favorable | Los tres perfiles tienen vistas separadas y flujos acordes con su actividad: autoservicio para el cliente, rapidez para POS y control para gerencia. |
| Económica | Favorable para un MVP | Se priorizaron componentes de código abierto y una base común para catálogo, checkout y administración. El costo inicial se concentra en infraestructura, dominio y futuros servicios de pago o facturación. |
| Riesgos | Controlables | La persistencia SQLite requiere un volumen o migración a PostgreSQL en producción; los pagos reales, autenticación y facturación deben incorporarse mediante servicios especializados. |

La relación costo-beneficio se justifica porque una sola plataforma cubre exhibición, captación, venta y auditoría. El beneficio esperado es reducir tareas manuales, evitar conflictos de inventario, acelerar la atención y disponer de información consolidada para decisiones comerciales. La primera versión mantiene bajo el costo de implementación y deja preparados los límites técnicos para crecer sin rehacer el dominio.

### Metodología de desarrollo y uso de GitHub

Se adoptó un enfoque **incremental y ágil**, entregando el sistema por módulos verificables: catálogo y fichas, checkout, POS, administración, persistencia y despliegue. Cada incremento se validó mediante compilación, pruebas de flujo en navegador y revisión de la matriz de trazabilidad.

**GitHub** se utilizó como plataforma de apoyo para:

- Control de versiones del código y documentación mediante Git.
- Organización del trabajo por commits funcionales y ramas del proyecto.
- Revisión del historial de cambios y recuperación de versiones.
- Integración con Railway para el despliegue continuo desde `main`.

Por tanto, GitHub es la herramienta de colaboración y configuración del flujo de entrega; la metodología aplicada al desarrollo es incremental/ágil, con validación continua de requisitos y entregables.

---

## 🚀 Estructura del Proyecto

```text
LocadedCar/
├── docs/                                # Documentación formal (PDFs y CSVs)
│   ├── Modelos_Relacionales_BD_LocadedCar.pdf
│   ├── matriz_trazabilidad_requisitos_llenada.pdf
│   └── matriz_trazabilidad_requisitos.csv
├── prisma/                              # Configuración de base de datos ORM
│   ├── schema.prisma                    # Definición de modelos de datos
│   └── seed.ts                          # Poblado de vehículos iniciales
├── public/                              # Recursos estáticos y multimedia
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── clientes/page.tsx        # CRM de clientes y prospectos
│   │   │   └── inventario/page.tsx      # Gestión de inventario de autos
│   │   ├── api/
│   │   │   └── checkout/route.ts        # Endpoint para procesamiento de compras
│   │   ├── catalogo/
│   │   │   ├── [id]/page.tsx            # Detalle del vehículo y botón de pago
│   │   │   └── page.tsx                 # Catálogo interactivo de autos
│   │   ├── checkout/
│   │   │   ├── CheckoutClient.tsx       # Flujo responsivo de pago en 3 pasos
│   │   │   └── page.tsx                 # Página Server Component de checkout
│   │   ├── contacto/page.tsx            # Contacto y cotizaciones VIP
│   │   ├── nosotros/page.tsx            # Identidad y valores de marca
│   │   ├── globals.css                  # Variables y utilidades Glassmorphism
│   │   ├── layout.tsx                   # Layout global con Navbar y Footer
│   │   └── page.tsx                     # Landing page principal
│   └── components/
│       ├── CarCard.tsx                  # Tarjeta individual con efectos hover
│       ├── CarMediaViewer.tsx           # Visor 3D y selector cromático
│       ├── CatalogGrid.tsx              # Cuadrícula responsiva de autos
│       ├── Hero.tsx                     # Sección hero con animaciones
│       └── Navbar.tsx                   # Barra de navegación translúcida
├── .env.example                         # Plantilla de variables de entorno
├── next.config.ts                       # Configuración del compilador Next.js
├── package.json                         # Dependencias y scripts de ejecución
├── tsconfig.json                        # Configuración estricta de TypeScript
└── README.md                            # Documentación principal del repositorio
```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/YvnPretty/LocadedCar.git
cd LocadedCar
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example`:
```bash
cp .env.example .env
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Inicializar y poblar la Base de Datos
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Iniciar en Modo Desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

### Despliegue en producción

La aplicación está publicada en Railway:

**[https://locadedcar-production.up.railway.app](https://locadedcar-production.up.railway.app)**

Rutas principales:

- [Catálogo](https://locadedcar-production.up.railway.app/catalogo)
- [Checkout](https://locadedcar-production.up.railway.app/checkout)
- [Panel administrativo](https://locadedcar-production.up.railway.app/admin)
- [Auditoría de ventas](https://locadedcar-production.up.railway.app/admin/ventas)

### 6. Compilar y Levantar en Producción
```bash
npm run build
npm run start
```

---

## 👤 Autor & Licencia

Desarrollado por el equipo de **LocadedCar**:

- Granados Sánchez Azucena
- Arteaga Villar Said Edgar
- López Salazar
- Vanegas Villar Lizbeth
- Meza Corella Cesae

Proyecto académico y demostrativo de alta gama para ingeniería de software.
