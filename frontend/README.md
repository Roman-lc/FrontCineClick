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

### Cartelera con filtros
- Bajo los banners, la cartelera se puede filtrar por **Cine** y **Fecha**
- El listado de fechas arranca en el día de hoy y suma los días que tienen funciones
- Al filtrar se consulta `GET /api/funciones` y solo se muestran las películas con una función vigente en ese cine y/o fecha
- El contador indica cuántas películas quedaron y con qué filtros
- Si ninguna cumple, aparece un estado vacío con el botón "Ver toda la cartelera"
- Al entrar a una película filtrada, los filtros viajan a `funciones.html` (cine y fecha) para no perder el contexto

### Funciones (Productos)
- Listado de funciones con película, cine, sala, fecha/hora, precio, formato, idioma
- Opción "Ver Detalle" para ver información completa
- Opción "Comprar" para iniciar flujo de compra
- Para ADMIN: opciones "Modificar" y "Borrar"

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
