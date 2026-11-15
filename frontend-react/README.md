<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/cineclick-logo-oscuro.svg">
    <img src="public/brand/cineclick-logo-claro.svg" alt="CineClick" height="64">
  </picture>
</p>

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
npm ci
npm run dev                 # http://localhost:5173
```

### Tarjetas de prueba

El pago es simulado: al backend solo llegan la marca y los últimos 4 dígitos.

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` (Visa) | Aprobado |
| `5555 5555 5555 4444` (Mastercard) | Aprobado |
| `3782 822463 10005` (American Express, código de 4 dígitos) | Aprobado |
| `4000 0000 0000 0002` (Visa) | **Rechazado**: sirve para probar el reintento, que no pierde la reserva |

Cualquier tarjeta que termine en `0002` se rechaza. Sirven cualquier vencimiento futuro, cualquier código de seguridad y cualquier DNI de 7 u 8 números.
