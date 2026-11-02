# CineClick · Frontend

TPO de Aplicaciones Interactivas: sitio de venta de entradas de cine.

- [`frontend-react/`](frontend-react/README.md): **el frontend actual** (React + Vite). Ahí están los pasos para levantarlo, las variables de entorno, las cuentas de prueba y las rutas.
- `frontend/`: la primera versión, en HTML, CSS y JavaScript sin frameworks. Queda como referencia; no se usa.

El backend (Spring Boot) está en [LucasGagliani/CineClick](https://github.com/LucasGagliani/CineClick).

## Inicio rápido

Con Java 21 y Node 22.12 o superior:

```bash
# 1. Backend (otra terminal): siembra los datos de demo la primera vez
git clone https://github.com/LucasGagliani/CineClick.git
cd CineClick
./mvnw spring-boot:run            # http://localhost:8080

# 2. Frontend
git clone https://github.com/Roman-lc/FrontCineClick.git
cd FrontCineClick/frontend-react
cp .env.example .env
npm install
npm run dev                       # http://localhost:5173
```

En la cartelera, el panel **Cuentas de prueba** permite entrar como administrador o como cada tipo de cliente.
