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

### Grupo / Compañía
- Integrantes aleatorios (4 personas)
- Descripción de CineClick

## Cómo usarlo

1. Levantar el backend:
```bash
./mvnw spring-boot:run
# o mvnw.cmd spring-boot:run en Windows
```
La API queda en `http://localhost:8080`

2. Abrir frontend:
- Abrir `frontend/index.html` directamente en navegador (file://) o con Live Server
- Recomendado usar Live Server para evitar problemas de CORS

## Notas

- **Baja lógica**: El backend hace DELETE como baja lógica (inactivo), lo cual se respeta
- **Butacas**: Al crear compra se validan butacas libres. Para simular error en pago usar `tokenPago: "rechazar"`
- **Producto = Función**: Tal como se pidió, el listado principal son las funciones
- **Solo tocar frontend/**: No se modificó ningún archivo fuera de esta carpeta
- **Mockup**: Disponible en `frontend/mockup/index.html`
