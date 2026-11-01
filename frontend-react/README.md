# CineClick · Frontend

Frontend en React (Vite + React Router, JavaScript) del TPO CineClick. Consume la API Spring Boot del repositorio `CineClick`.

## Cómo levantarlo

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

El backend tiene que estar en `http://localhost:8080`. En desarrollo, Vite manda `/api/...` a ese puerto (ver `vite.config.js`).

## Mocks o API real

| Variable | Qué hace |
|---|---|
| `VITE_USE_MOCKS=true` | Los servicios (`src/services`) responden con los datos de `src/mocks`, sin backend. Es el valor de `.env.development`. |
| `VITE_USE_MOCKS=false` | Usa la API real. Para tenerlo solo en tu máquina, ponelo en `.env.development.local` (no se sube). |
| `VITE_MOCK_ERROR=true` | Con mocks, todas las respuestas fallan. Sirve para ver los estados de error. |

Los mocks tienen la misma forma que los DTO del backend. Las compras y los usuarios nuevos de los mocks viven en memoria y se pierden al recargar la página.

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| `cliente@cineclick.com` | `cliente123` | Cliente (mocks y API) |
| `admin@cineclick.com` | `admin123` | Administrador (mocks y API) |

Con la API, el `DataSeeder` del backend crea los dos usuarios al arrancar. También se pueden crear clientes desde **Crear cuenta**. Las cuentas de administrador no pueden comprar entradas.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Cartelera: destacadas, películas del día con sus horarios y próximos estrenos |
| `/peliculas/:slug` | Detalle de la película y horarios por cine |
| `/cines`, `/cines/:slug` | Cines con foto, contacto y mapa; cartelera de cada cine |
| `/promociones` | Códigos vigentes ("Usar en mi compra" lo deja listo para el pago) |
| `/mis-compras` | Compras del cliente: próximas y anteriores |
| `/compra/...` | Flujo de compra (abajo) |
| `/admin` | Panel de administración (solo rol ADMIN) |

## Panel de administración

Tiene su propio layout con tema claro y navegación lateral. Mientras hay una sesión de administrador, una franja azul arriba de todo lo indica en todo el sitio.

| Ruta | Qué hace |
|---|---|
| `/admin` | Métricas: ingresos, entradas, ocupación y ticket promedio contra el período anterior; próximas funciones; conversión del checkout; ranking de películas; tipos de entrada; ventas por franja; por cine; promociones y asistencia. Los filtros (período y cine) quedan en la URL |
| `/admin/cines`, `/salas`, `/peliculas`, `/funciones`, `/promociones` | Gestión: tabla con buscador y filtro de estado, formulario en un panel lateral y eliminar con confirmación. Si el registro tiene datos asociados, el backend responde 409 y se ofrece desactivarlo (o cancelar la función) |
| `/admin/validar` | Control de ingreso: se elige la función y se escribe el código de la entrada (o se escanea el QR con la cámara, en los navegadores que tienen `BarcodeDetector`) |

Los formularios aplican las mismas reglas que el backend: conjuntos cerrados en selects (provincia, barrio de CABA, calificación, idioma, género, formato, tipo de sala), textos sin espacios de más, teléfono de 10 dígitos, números con mínimo y máximo, y funciones sin superposición en la sala. El panel va siempre contra la API (no tiene mocks).

Las métricas se cargan con `React.lazy`: Recharts queda en un archivo aparte y no entra en el sitio público.

## Flujo de compra

1. En la cartelera o en el detalle de una película, tocar un horario lo selecciona y muestra una barra abajo con **Comprar entradas**.
2. Si no hay sesión, se pide el login y después se vuelve directo al paso 1 (`/login?volver=/compra/:id/entradas`).
3. Los tres pasos:

| Ruta | Paso |
|---|---|
| `/compra/:funcionId/entradas` | Tipo de entrada y cantidad (General, Menor, Jubilado), hasta 10 |
| `/compra/:funcionId/butacas` | Mapa de la sala. Al continuar se crea la reserva, que dura 8 minutos |
| `/compra/:funcionId/pago` | Datos de la tarjeta, términos, código promocional y pago |
| `/compra/confirmacion/:compraId` | Entradas con su QR y código, desglose, imprimir y agregar al calendario (.ics). Es la misma pantalla que el detalle desde Mis compras |

La compra en curso se guarda en `sessionStorage` (`cineclick_compra`). Volver al mapa con una reserva activa la cancela, y las butacas quedan libres.

### Tarjetas de prueba

El pago es simulado. Los datos completos de la tarjeta no se envían ni se guardan: al backend solo llegan la marca y los últimos 4 dígitos.

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` (Visa) | Aprobado |
| `5555 5555 5555 4444` (Mastercard) | Aprobado |
| `3782 822463 10005` (American Express, código de 4 dígitos) | Aprobado |
| `4000 0000 0000 0002` (Visa) | **Rechazado**. Sirve para probar el reintento, que no pierde la reserva |

Cualquier tarjeta que termine en `0002` se rechaza. Sirven cualquier vencimiento futuro, cualquier código de seguridad y cualquier DNI de 7 u 8 números.

### Otros datos para probar

- Código promocional: `ESTRENO10` (10 % de descuento).
- Con mocks, la butaca **E7** de cualquier función "se ocupa" la primera vez que se intenta reservar. Sirve para ver el 409: el mapa se actualiza y aparece "Esa butaca se acaba de ocupar. Elegí otra".

## Colores

Todos los colores salen de `src/styles/tokens.css`: "Afiche noche" (oscuro) en el sitio y "Afiche claro" en `/admin/*` (`data-theme="admin"`). Los componentes no tienen colores escritos a mano; las únicas excepciones son el QR de las entradas (oscuro sobre claro, para que lo lean todos los lectores) y la hoja de impresión (blanco y negro).

El rojo del acento se usa solo para lo que lleva a comprar o indica una selección (botón principal, horario y butacas elegidos, sección activa, logo). Los errores van en carmesí y siempre con un ícono.

## Dependencias

Además de React y React Router: `qrcode.react` (QR de las entradas) y `recharts` 3.10.1 (gráficos de las métricas, versión fija).

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run lint      # oxlint
npm run format    # prettier
```

## Limitaciones conocidas

- La API no tiene autenticación: la sesión (en `localStorage`) y las rutas protegidas solo ordenan la interfaz, no son seguridad. Las métricas mandan el id del usuario en `X-Usuario-Id` y el backend controla que sea administrador, pero ese encabezado se puede falsificar.
- Las contraseñas se guardan en texto plano en el backend.
