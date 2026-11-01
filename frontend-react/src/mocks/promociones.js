import { hoyISO, sumarDiasISO } from '../lib/fechas.js';

// Misma forma que PromocionResponseDTO. ESTRENO10 es la que crea el DataSeeder (tambien la acepta mocks/compras.js).
export const promocionesMock = [
  {
    id: 1,
    codigo: 'ESTRENO10',
    titulo: 'Estrenos online',
    descripcion: 'Para cualquier función y formato. Un código por compra, hasta 10 entradas.',
    porcentajeDescuento: 10,
    fechaInicio: sumarDiasISO(hoyISO(), -1),
    fechaFin: sumarDiasISO(hoyISO(), 60),
    activa: true,
  },
  // Vence pronto: muestra el aviso de "Vence en N días"
  {
    id: 2,
    codigo: 'FINDE15',
    titulo: 'Fin de semana largo',
    descripcion: 'Para cualquier función. Un código por compra.',
    porcentajeDescuento: 15,
    fechaInicio: sumarDiasISO(hoyISO(), -3),
    fechaFin: sumarDiasISO(hoyISO(), 2),
    activa: true,
  },
];
