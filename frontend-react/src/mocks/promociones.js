// Misma forma que PromocionResponseDTO. ESTRENO10 es la que crea el DataSeeder (tambien la acepta mocks/compras.js).
const enDias = (dias, hora = '00:00:00') => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${hora}`;
};

const base = {
  descripcion: null,
  activa: true,
  diasSemana: [],
  usosMaximosTotales: null,
  usosActuales: 0,
  usosMaximosPorUsuario: null,
  soloPrimeraCompra: false,
  maxEntradasConDescuento: null,
  montoMaximoDescuento: null,
  usablePorUsuario: null,
  motivoNoUsable: null,
};

export const promocionesMock = [
  {
    ...base,
    id: 1,
    codigo: 'ESTRENO10',
    titulo: 'Estrenos online',
    descripcion: 'Para cualquier función y formato.',
    porcentajeDescuento: 10,
    vigenciaDesde: enDias(-1),
    vigenciaHasta: enDias(60, '23:59:59'),
  },
  // Fin de semana, con tope de usos casi agotado: muestra los badges de dias y "Quedan N"
  {
    ...base,
    id: 2,
    codigo: 'FINDE15',
    titulo: 'Fin de semana largo',
    porcentajeDescuento: 15,
    vigenciaDesde: enDias(-3),
    vigenciaHasta: enDias(2, '23:59:59'),
    diasSemana: ['SATURDAY', 'SUNDAY'],
    usosMaximosTotales: 100,
    usosActuales: 88,
    maxEntradasConDescuento: 2,
  },
];
