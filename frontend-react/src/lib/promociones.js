import { formatearPrecio } from './formato';

export const DIAS_SEMANA = [
  { valor: 'MONDAY', corto: 'Lun', plural: 'lunes' },
  { valor: 'TUESDAY', corto: 'Mar', plural: 'martes' },
  { valor: 'WEDNESDAY', corto: 'Mié', plural: 'miércoles' },
  { valor: 'THURSDAY', corto: 'Jue', plural: 'jueves' },
  { valor: 'FRIDAY', corto: 'Vie', plural: 'viernes' },
  { valor: 'SATURDAY', corto: 'Sáb', plural: 'sábados' },
  { valor: 'SUNDAY', corto: 'Dom', plural: 'domingos' },
];

const ordenados = (dias = []) => DIAS_SEMANA.filter((d) => dias.includes(d.valor));
const todos = (dias = []) => dias.length === 0 || dias.length === 7;
const enLista = (partes) => (partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`);

export function diasCortos(dias) {
  return todos(dias) ? 'Todos' : ordenados(dias).map((d) => d.corto).join(' · ');
}

export function condicionesDe(promo) {
  const partes = [todos(promo.diasSemana) ? 'Válida todos los días' : `Válida ${enLista(ordenados(promo.diasSemana).map((d) => d.plural))}`];
  if (promo.soloPrimeraCompra) partes.push('Solo para tu primera compra');
  if (promo.usosMaximosPorUsuario) partes.push(`${promo.usosMaximosPorUsuario} ${promo.usosMaximosPorUsuario === 1 ? 'uso' : 'usos'} por usuario`);
  if (promo.usosMaximosTotales) partes.push(`hasta ${promo.usosMaximosTotales} usos`);
  if (promo.maxEntradasConDescuento) {
    partes.push(`${promo.maxEntradasConDescuento} ${promo.maxEntradasConDescuento === 1 ? 'entrada' : 'entradas'} con descuento por compra`);
  }
  if (promo.montoMaximoDescuento) partes.push(`hasta ${formatearPrecio(promo.montoMaximoDescuento)} de descuento`);
  return partes.join(' · ');
}

export function estadoPromocion(promo, ahora = new Date()) {
  if (!promo.activa) return 'Inactiva';
  if (promo.usosMaximosTotales && promo.usosActuales >= promo.usosMaximosTotales) return 'Agotada';
  if (ahora < new Date(promo.vigenciaDesde)) return 'Programada';
  if (ahora > new Date(promo.vigenciaHasta)) return 'Vencida';
  return 'Activa';
}

export function usosRestantes(promo) {
  return promo.usosMaximosTotales ? Math.max(0, promo.usosMaximosTotales - promo.usosActuales) : null;
}
