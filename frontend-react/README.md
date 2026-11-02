# CineClick · Frontend

Frontend en React (Vite + React Router, JavaScript) del TPO CineClick. Consume la API Spring Boot del repositorio [`CineClick`](https://github.com/LucasGagliani/CineClick) (backend). Todos los datos salen de la API: no hay mocks ni datos de respaldo.

## Requisitos

- **Node 22.12 o superior** (Vite 8 no corre en versiones anteriores). Se instala con npm, que viene con Node.
- **El backend corriendo** en `http://localhost:8080` (ver su README: con Java 21 alcanza con `./mvnw spring-boot:run`).

## Levantar desde cero

```bash
git clone https://github.com/Roman-lc/FrontCineClick.git
cd FrontCineClick/frontend-react
cp .env.example .env        # en Windows (CMD): copy .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Con el backend recién arrancado ya hay datos de demo: cartelera con horarios, compras, métricas y promociones. En **Ingresar** está el listado **Cuentas de prueba** para entrar con un clic.

## Variables de entorno

Se leen de `.env` (copia de `.env.example`, que tiene los valores para desarrollo). Todo lo que empieza con `VITE_` termina en el bundle y es público: no van secretos.

| Variable | Valor por defecto | Qué hace |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL del backend. **Obligatoria**: si falta, la app escribe un error claro en la consola al iniciar y las pantallas muestran el estado de error (no hay datos de respaldo). Con `/` usa rutas relativas que el proxy de Vite manda a `localhost:8080` (sirve para abrir el sitio desde otro dispositivo, ver abajo). |
| `VITE_DEMO_MODE` | `true` | Muestra el listado "Cuentas de prueba" debajo del formulario de login. Con `false` no aparece. |

Si la API no responde, cada pantalla muestra su estado de error con **Reintentar**.

## Cuentas de prueba

Las crea el seed del backend (perfil `demo`). Con `VITE_DEMO_MODE=true` están debajo del formulario de login, con un botón **Ingresar con esta cuenta**.

| Cuenta | Email | Contraseña | Qué muestra |
|---|---|---|---|
| Administrador | `admin@cineclick.com` | `admin123` | Panel completo: métricas con datos, compras, validación, promociones en todos sus estados |
| Cliente frecuente | `ana@cineclick.com` | `ana123` | Compras próximas y anteriores, entradas usadas, una compra arrepentida y otra pendiente de revisión |
| Cliente con función hoy | `martin@cineclick.com` | `martin123` | Mis compras con "Hoy" y el QR de cada entrada |
| Cliente nuevo | `sofia@cineclick.com` | `sofia123` | Sin compras: puede usar `BIENVENIDA` (primera entrada gratis) |
| Cliente ocasional | `diego@cineclick.com` | `diego123` | Tres compras: una vista, una próxima y una vencida |

Las cuentas de administrador no pueden comprar entradas.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Cartelera: destacadas, películas del día con sus horarios y próximos estrenos |
| `/peliculas/:slug` | Detalle de la película y horarios por cine |
| `/cines`, `/cines/:slug` | Cines con foto, contacto y mapa; cartelera de cada cine |
| `/promociones` | Promociones vigentes con sus condiciones; con sesión, las que el cliente no puede usar aparecen atenuadas con el motivo |
| `/mis-compras` | Compras del cliente: próximas y anteriores |
| `/compra/...` | Flujo de compra (abajo) |
| `/arrepentimiento` | Botón de arrepentimiento (público, sin login) |
| `/soporte` | Formulario de ayuda; el botón flotante "Ayuda" lleva acá |
| `/nosotros`, `/terminos`, `/privacidad` | Páginas institucionales |
| `/admin/*` | Panel de administración (solo rol ADMIN) |

## Panel de administración

Layout propio con tema claro y navegación lateral. Todas las pantallas del panel se cargan aparte (`React.lazy`), así que no pesan en el sitio público.

| Ruta | Qué hace |
|---|---|
| `/admin` | Métricas: ingresos, entradas, ocupación y ticket promedio contra el período anterior; próximas funciones; conversión; ranking; tipos de entrada; ventas por franja; por cine; promociones y asistencia |
| `/admin/cines`, `/salas`, `/peliculas`, `/funciones`, `/promociones` | Gestión: tabla con buscador y filtros, formulario en un panel lateral, eliminar con confirmación (con datos asociados se ofrece desactivar). En funciones, la hora va de a 5 minutos |
| `/admin/compras` | Compras de todos los clientes con filtros (N° de compra o código de entrada, email, cine, estado, fechas) y paginación. Al tocar una fila, el detalle: función, entradas, pago, promoción, arrepentimiento y consultas de soporte. `?compra=N` abre el detalle directo |
| `/admin/validar` | Control de ingreso (abajo) |
| `/admin/arrepentimientos` | Solicitudes: aprobar o rechazar las que llegaron fuera de plazo |
| `/admin/soporte` | Consultas: filtrar y marcar como resueltas |

### Validación de entradas

El código alcanza: el backend deduce película, sala, butaca y horario. La primera vez se elige el **cine del puesto**, que queda guardado en ese dispositivo ("Controlando: Abasto · Cambiar").

- **Lector de mano** (USB o Bluetooth, funciona como teclado): el campo tiene el foco siempre, envía con Enter y se limpia después de cada resultado. Acepta el código con guiones o espacios, o una URL que lo contenga.
- **Cámara**: "Escanear con la cámara" abre la cámara trasera y valida cada QR que lee sin cerrarse. Usa la API nativa `BarcodeDetector` y, donde no existe (Firefox, Safari), la librería [`barcode-detector`](https://www.npmjs.com/package/barcode-detector) 3.2.3 (con su `.wasm` servido por el propio sitio). Elegida por tener la misma API que la nativa, mantenimiento activo y ningún advisory en OSV.
- El resultado se ve en grande hasta la próxima lectura o hasta **Siguiente**: válida (con la sala bien grande y el aviso "Pedir DNI del menor" o "Pedir credencial de jubilado"), ya usada (con la hora), de otro cine, fuera de horario (temprano, terminada u otro día), anulada o inexistente. En el celular vibra distinto para válida y rechazada.
- Abajo, las últimas 10 validaciones del puesto.

La ventana de ingreso es de 60 minutos antes a 30 minutos después del inicio de la función.

### Probar la cámara desde un celular

La cámara del navegador solo funciona en HTTPS o en `localhost`. Para abrir el sitio desde un celular de la misma red:

1. Instalar [mkcert](https://github.com/FiloSottile/mkcert) y crear la autoridad local (una sola vez): `mkcert -install`.
2. En `frontend-react/`, generar el certificado con la IP de la compu (por ejemplo `192.168.0.23`):
   ```bash
   mkdir certs
   mkcert -cert-file certs/cineclick-dev.pem -key-file certs/cineclick-dev-key.pem localhost 127.0.0.1 192.168.0.23
   ```
   Si existen esos dos archivos, `vite.config.js` levanta el servidor con HTTPS. La carpeta `certs/` está en `.gitignore`.
3. En `.env`, poner `VITE_API_URL=/`: el celular no puede llegar a `localhost:8080`, así que los pedidos pasan por el proxy de Vite.
4. `npm run dev -- --host` y abrir `https://192.168.0.23:5173` en el celular. Para que el celular confíe en el certificado, instalar la CA de mkcert (`mkcert -CAROOT` dice dónde está) o aceptar la advertencia del navegador.

Si la cámara no está disponible o se niega el permiso, aparece un aviso y queda el campo manual.

## Flujo de compra

1. En la cartelera o en el detalle de una película, tocar un horario lo selecciona y muestra una barra abajo con **Comprar entradas** (y "Ver qué más podés ver ese día", para armar una doble función).
2. Si no hay sesión, se pide el login y después se vuelve directo al paso 1.
3. Los pasos:

| Ruta | Paso |
|---|---|
| `/compra/:funcionId/entradas` | Tipo de entrada y cantidad (General, Menor, Jubilado), hasta 10 |
| `/compra/:funcionId/butacas` | Mapa de la sala. Al continuar se crea la reserva, que dura 8 minutos |
| `/compra/:funcionId/pago` | Código promocional, tarjeta y términos. Si el descuento cubre todo, "Esta compra no tiene cargo" y alcanza con confirmar |
| `/compra/confirmacion/:compraId` | Entradas con su QR y código, desglose, imprimir, calendario (.ics), arrepentimiento y "¿Te quedás para otra?" |

### Tarjetas de prueba

El pago es simulado: al backend solo llegan la marca y los últimos 4 dígitos.

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` (Visa) | Aprobado |
| `5555 5555 5555 4444` (Mastercard) | Aprobado |
| `3782 822463 10005` (American Express, código de 4 dígitos) | Aprobado |
| `4000 0000 0000 0002` (Visa) | **Rechazado**: sirve para probar el reintento, que no pierde la reserva |

Cualquier tarjeta que termine en `0002` se rechaza. Sirven cualquier vencimiento futuro, cualquier código de seguridad y cualquier DNI de 7 u 8 números.

## Reglas de promociones

Cada promoción puede tener vigencia con fecha y hora, días de la semana (se comparan con el día de la función), tope de usos totales y por usuario, "solo primera compra", máximo de entradas con descuento (las de mayor precio) y monto máximo de descuento. La tarjeta pública arma las condiciones en texto a partir de esas reglas. El seed trae una de cada caso:

| Código | Regla |
|---|---|
| `BIENVENIDA` | 100 % en 1 entrada, solo primera compra, 1 uso por usuario |
| `LUNMIEVIE20` | 20 % los lunes, miércoles y viernes |
| `MIERCOLES50` | 50 % los miércoles, máximo 2 entradas con descuento |
| `FUGAZ30` | 30 %, tope de 50 usos (42 usados: "Quedan 8") y vence en menos de 24 h |
| `ESTRENO10` | 10 %, sin restricciones |
| `PRIMAVERA15` · `CYBERCINE25` · `PREESTRENO40` | Vencida, programada para la semana que viene y agotada (para ver todos los estados en el admin) |

## Colores

Todos los colores salen de `src/styles/tokens.css`: "Afiche noche" (oscuro) en el sitio y "Afiche claro" en `/admin/*`. Los componentes no tienen colores escritos a mano; las excepciones son el QR (oscuro sobre claro, para que lo lean todos los lectores) y la hoja de impresión.

## Dependencias

Además de React y React Router: `qrcode.react` (QR de las entradas), `recharts` 3.10.1 (gráficos de las métricas) y `barcode-detector` 3.2.3 con `zxing-wasm` 3.1.6 (lectura de QR sin `BarcodeDetector` nativo). Las tres últimas con versión fija.

Los pósters y las fotos de los cines están en `public/img/`, así el sitio no depende de que respondan sitios externos.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run lint      # oxlint
npm run format    # prettier
```

## Limitaciones conocidas

- **Autenticación sin tokens.** La sesión vive en `localStorage` y cada pedido manda el id del usuario en el encabezado `X-Usuario-Id`. El backend verifica que ese usuario sea administrador en los endpoints del panel, pero el encabezado se puede falsificar: es un control básico, no seguridad real.
- **Sin envío de mails.** Los números de solicitud (arrepentimiento y soporte) y las entradas se muestran en pantalla.
- **Pagos simulados.** No hay pasarela: el resultado depende de los últimos 4 dígitos.
