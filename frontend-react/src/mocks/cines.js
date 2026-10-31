// Misma forma que CineResponseDTO, copiado de GET /api/cines.
// En la base, Recoleta no tiene salas; aca se le agrega una para tener funciones en dos cines.
export const cinesMock = [
  {
    id: 1,
    nombre: 'CineClick Abasto',
    direccion: 'Av. Corrientes 3247',
    ciudad: 'Buenos Aires',
    telefono: '011-4000-1000',
    activo: true,
    salas: [
      { id: 1, nombre: 'Sala 1', numero: 1, tipo: 'TRADICIONAL', activa: true, capacidad: 40 },
      { id: 2, nombre: 'Sala IMAX', numero: 2, tipo: 'IMAX', activa: true, capacidad: 28 },
    ],
  },
  {
    id: 2,
    nombre: 'CineClick Recoleta',
    direccion: 'Av. Pueyrredón 1852',
    ciudad: 'CABA',
    telefono: '',
    activo: true,
    salas: [{ id: 3, nombre: 'Sala 1', numero: 1, tipo: 'TRADICIONAL', activa: true, capacidad: 40 }],
  },
];
