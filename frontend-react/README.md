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

| Email | Contraseña | Dónde |
|---|---|---|
| `cliente@cineclick.com` | `cliente123` | Solo mocks |
| `admin@cineclick.com` | `admin123` | Mocks y API (lo crea el `DataSeeder`) |

Con la API real hay que crear la cuenta desde **Crear cuenta**. Las cuentas de administrador no pueden comprar entradas.

## Flujo de compra

1. En la cartelera o en el detalle de una película, tocar un horario lo selecciona y muestra una barra abajo con **Comprar entradas**.
2. Si no hay sesión, se pide el login y después se vuelve directo al paso 1 (`/login?volver=/compra/:id/entradas`).
3. Los tres pasos:

| Ruta | Paso |
|---|---|
| `/compra/:funcionId/entradas` | Tipo de entrada y cantidad (General, Menor, Jubilado), hasta 10 |
| `/compra/:funcionId/butacas` | Mapa de la sala. Al continuar se crea la reserva, que dura 8 minutos |
| `/compra/:funcionId/pago` | Datos de la tarjeta, términos, código promocional y pago |
| `/compra/confirmacion/:compraId` | Códigos de las entradas |

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

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run lint      # oxlint
npm run format    # prettier
```

## Limitaciones conocidas

- La API no tiene autenticación: la sesión (en `localStorage`) y las rutas protegidas solo ordenan la interfaz, no son seguridad.
- Las contraseñas se guardan en texto plano en el backend.
