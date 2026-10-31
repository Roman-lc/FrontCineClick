import { capacidadDeSala } from './salas.js';

// Misma forma que CineResponseDTO. Cada sala tiene un plano distinto (ver salas.js).
function sala(id, nombre, numero, tipo) {
  return { id, nombre, numero, tipo, activa: true, capacidad: capacidadDeSala(id) };
}

export const cinesMock = [
  {
    id: 1,
    nombre: 'CineClick Abasto',
    direccion: 'Av. Corrientes 3247',
    ciudad: 'Buenos Aires',
    telefono: '011-4000-1000',
    activo: true,
    salas: [sala(1, 'Sala 1', 1, 'TRADICIONAL'), sala(2, 'Sala IMAX', 2, 'IMAX')],
  },
  {
    id: 2,
    nombre: 'CineClick Recoleta',
    direccion: 'Av. Pueyrredón 1852',
    ciudad: 'CABA',
    telefono: '',
    activo: true,
    salas: [sala(3, 'Sala 1', 1, 'TRADICIONAL'), sala(4, 'Sala Premium', 2, 'PREMIUM')],
  },
  {
    id: 3,
    nombre: 'CineClick Palermo',
    direccion: 'Av. Santa Fe 3253',
    ciudad: 'CABA',
    telefono: '011-4000-3000',
    activo: true,
    salas: [sala(5, 'Sala 4D', 1, 'CUATRO_D')],
  },
];
