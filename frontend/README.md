# CineClick - Frontend (HTML + JS + CSS)

Frontend básico para CineClick, consumiendo la API REST del backend (`http://localhost:8080`).

## Estructura de carpetas

```
frontend/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── comun.js
│       ├── cartelera.js
│       ├── fechas.js
│       ├── funciones.js
│       ├── detalle.js
│       ├── compra.js
│       ├── admin.js
│       ├── admin-create.js
│       ├── admin-edit.js
│       ├── grupo.js
│       └── login.js
├── components/
├── mockup/
│   ├── index.html
│   └── style.css
├── pages/
│   ├── admin.html
│   ├── admin-create.html
│   ├── admin-edit.html
│   ├── compra.html
│   ├── detalle.html
│   ├── funciones.html
│   ├── grupo.html
│   └── login.html
├── index.html
└── README.md
```

## Funcionalidades

### Landing Page
- Presentación de CineClick
- Acceso directo a funciones disponibles

### Scripts compartidos
- `assets/js/fechas.js`: utilidades de fecha (las fechas viajan como `yyyy-mm-dd` para no tener corrimientos de zona horaria), `funcionVigente()` (descarta canceladas y ya empezadas) y formateo de horarios en 24h
- `assets/js/comun.js`: `escapeHtml()` para interpolar texto del backend dentro de `innerHTML`

### Cartelera con filtros
- Bajo los banners, dos tiras de chips: **Cine** y **Fecha**
- Cine: chip "Todos" + un chip por cine activo (con la ciudad debajo)
- Fecha: chip "Todas" + una tira fija de 7 días desde hoy (Hoy, Mañana y los días de la semana)
- Los días sin funciones quedan atenuados y deshabilitados, así no se llega a una cartelera vacía por fecha
- Solo se listan películas activas **con al menos una función vigente**; al filtrar se consulta `GET /api/funciones` y se muestran las que tienen función en ese cine y/o fecha
- Si ninguna cumple, aparece un estado vacío con el botón "Ver toda la cartelera"
- Al entrar a una película filtrada, los filtros viajan a `funciones.html` (cine y fecha) y el botón "Volver a Cartelera" los restaura
- La página de funciones muestra una barra con los filtros activos y un botón "Ver todas las funciones" para quitarlos sin perder la película

### Funciones (Productos)
- Solo muestra funciones vigentes (no canceladas y que todavía no empezaron)
- Sin película elegida (al entrar desde "Funciones" en el navbar) se agrupa **por película**: cada una muestra sus cines y sus horarios como chips compactos, y un botón "Ver todos los horarios"
- Al elegir una película (`?peliculaId=`) el listado pasa a detallado **por cine**, con sala, fecha/hora, precio, formato e idioma
- En el listado detallado: opción "Ver Detalle", "Comprar" y, para ADMIN, "Modificar" y "Borrar"
- Los filtros de cine y fecha de la cartelera se conservan tanto en los chips de horario como en "Ver todos los horarios"

### Detalle de Función
- Muestra sinopsis, duración, género, clasificación, formatos disponibles
- Información completa de cine, sala, horario
- Botón para ir a comprar

### Flujo de Compra (Completo)
1. **Seleccionar butacas** - Mapa interactivo con butacas libres/ocupadas/VIP
2. **Datos del cliente** - Nombre, apellido, email, teléfono
3. **Pago** - Método de pago, código promoción (ESTRENO10), token de pago
- Crea compra (`POST /api/compras`) y luego paga (`POST /api/compras/{id}/pagos`)
- Usa API real contra backend

### Panel de Administrador
- Solo visible para usuarios con rol ADMIN
- Listado completo de funciones con acciones
- Crear nueva función (película, cine, sala, fecha/hora, precio, formato, idioma)
- Modificar función existente
- Eliminar función

### Login
- Autenticación contra `/api/auth/login`
- Guarda usuario en localStorage
- Demo: admin@cineclick.com / admin123

### Crear Cuenta
- Formulario de registro contra `/api/clientes` (nombre, apellido, email, contraseña y teléfono opcional)
- Validaciones en el navegador: campos obligatorios, contraseña de mínimo 4 caracteres y confirmación coincidente
- Muestra el error del backend si el email ya está registrado (409)
- Al crearse la cuenta inicia sesión automáticamente y redirige al inicio

### Grupo / Compañía
- Integrantes del grupo (Rodrigo, Gianluca, Lucas y Roman)
- Descripción de CineClick

## Cómo usarlo

1. Levantar el backend:
```bash
./mvnw spring-boot:run
# o mvnw.cmd spring-boot:run en Windows
```
La API queda en `http://localhost:8080`

2. Abrir frontend:
   - Con el servidor incluido (recomendado, sin dependencias):
     ```bash
     node dev-server.mjs        # http://localhost:5173
     node dev-server.mjs 3000   # otro puerto
     ```
   - O con Live Server / cualquier servidor estatico
   - Evitar abrir con `file://`: el navegador bloquea las llamadas a la API

## Notas

- **Baja lógica**: El backend hace DELETE como baja lógica (inactivo), lo cual se respeta
- **Butacas**: Al crear compra se validan butacas libres. Para simular error en pago usar `tokenPago: "rechazar"`
- **Producto = Función**: Tal como se pidió, el listado principal son las funciones
- **Solo tocar frontend/**: No se modificó ningún archivo fuera de esta carpeta
- **Mockup**: Disponible en `frontend/mockup/index.html`
