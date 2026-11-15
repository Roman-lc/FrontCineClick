export const FILTRO_ESTADO = [
  { valor: 'activos', texto: 'Activos' },
  { valor: 'inactivos', texto: 'Inactivos' },
  { valor: 'todos', texto: 'Todos' },
];

export function cumpleEstado(activo, filtro) {
  if (filtro === 'activos') return activo;
  if (filtro === 'inactivos') return !activo;
  return true;
}
