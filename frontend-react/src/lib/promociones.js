// Reglas de las promociones en texto. Lo usan la vista previa del panel y la tarjeta publica, asi lo que se
// muestra sale de los mismos campos que valida el backend (nunca se contradicen).
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

// "Lun · Mié · Vie" o "Todos"
export function diasCortos(dias) {
  return todos(dias) ? 'Todos' : ordenados(dias).map((d) => d.corto).join(' · ');
}

// "Válida lunes, miércoles y viernes · 1 uso por usuario · hasta 100 usos · 1 entrada con descuento por compra"
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

// Activa, Programada (todavia no empezo), Vencida, Agotada o Inactiva
export function estadoPromocion(promo, ahora = new Date()) {
  if (!promo.activa) return 'Inactiva';
  if (promo.usosMaximosTotales && promo.usosActuales >= promo.usosMaximosTotales) return 'Agotada';
  if (ahora < new Date(promo.vigenciaDesde)) return 'Programada';
  if (ahora > new Date(promo.vigenciaHasta)) return 'Vencida';
  return 'Activa';
}

// Usos que quedan, si tiene tope
export function usosRestantes(promo) {
  return promo.usosMaximosTotales ? Math.max(0, promo.usosMaximosTotales - promo.usosActuales) : null;
}
