// Cuentas que crea el seed del backend (perfil demo). El panel "Cuentas de prueba" solo se muestra con
// VITE_DEMO_MODE=true (ver .env.example). destino: a donde lleva "Ingresar con esta cuenta".
export const DEMO_ACTIVA = import.meta.env.VITE_DEMO_MODE === 'true';

export const CUENTAS_DEMO = [
  {
    rol: 'Administrador',
    nombre: 'Admin',
    email: 'admin@cineclick.com',
    password: 'admin123',
    muestra: 'El panel completo: métricas con datos, compras, validación de entradas y promociones en todos sus estados.',
    destino: '/admin',
  },
  {
    rol: 'Cliente frecuente',
    nombre: 'Ana',
    email: 'ana@cineclick.com',
    password: 'ana123',
    muestra: 'Muchas compras: próximas, anteriores con entradas usadas, una arrepentida y otra pendiente de revisión.',
    destino: '/mis-compras',
  },
  {
    rol: 'Cliente con función hoy',
    nombre: 'Martín',
    email: 'martin@cineclick.com',
    password: 'martin123',
    muestra: 'Una función hoy a la noche: Mis compras con "Hoy" y el QR de cada entrada.',
    destino: '/mis-compras',
  },
  {
    rol: 'Cliente nuevo',
    nombre: 'Sofía',
    email: 'sofia@cineclick.com',
    password: 'sofia123',
    muestra: 'Sin compras: puede usar la promoción BIENVENIDA (primera entrada gratis).',
    destino: '/promociones',
  },
  {
    rol: 'Cliente ocasional',
    nombre: 'Diego',
    email: 'diego@cineclick.com',
    password: 'diego123',
    muestra: 'Tres compras: una vista, una próxima y una que venció sin pagarse.',
    destino: '/mis-compras',
  },
];
