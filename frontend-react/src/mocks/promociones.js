import { hoyISO, sumarDiasISO } from '../lib/fechas.js';

// Misma forma que PromocionResponseDTO. ESTRENO10 es la que crea el DataSeeder (tambien la acepta mocks/compras.js).
export const promocionesMock = [
  {
    id: 1,
    codigo: 'ESTRENO10',
    descripcion: '10% de descuento en compras online',
    porcentajeDescuento: 10,
    fechaInicio: sumarDiasISO(hoyISO(), -1),
    fechaFin: sumarDiasISO(hoyISO(), 60),
    activa: true,
  },
];
