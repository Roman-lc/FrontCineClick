import { capacidadDeSala } from './salas.js';

// Misma forma que CineResponseDTO. Cada sala tiene un plano distinto (ver salas.js).
function sala(id, nombre, numero, tipo) {
  return { id, nombre, numero, tipo, activa: true, capacidad: capacidadDeSala(id) };
}

export const cinesMock = [
  {
    id: 1,
    nombre: 'CineClick Abasto',
    provincia: 'CABA',
    localidad: 'Balvanera',
    calle: 'Av. Corrientes',
    altura: 3247,
    telefono: '1140001000',
    urlImagen: '/img/cines/abasto.jpg',
    activo: true,
    salas: [sala(1, 'Sala 1', 1, 'TRADICIONAL'), sala(2, 'Sala IMAX', 2, 'IMAX')],
  },
  {
    id: 2,
    nombre: 'CineClick Recoleta',
    provincia: 'CABA',
    localidad: 'Recoleta',
    calle: 'Av. Pueyrredón',
    altura: 1852,
    telefono: null,
    urlImagen: '/img/cines/recoleta.jpg',
    activo: true,
    salas: [sala(3, 'Sala 1', 1, 'TRADICIONAL'), sala(4, 'Sala Premium', 2, 'PREMIUM')],
  },
  {
    id: 3,
    nombre: 'CineClick Palermo',
    provincia: 'CABA',
    localidad: 'Palermo',
    calle: 'Av. Santa Fe',
    altura: 3253,
    telefono: '1140003000',
    urlImagen: '/img/cines/palermo.jpg',
    activo: true,
    salas: [sala(5, 'Sala 4D', 1, 'CUATRO_D')],
  },
];
