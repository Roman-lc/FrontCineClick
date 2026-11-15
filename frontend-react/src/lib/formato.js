import { CLASIFICACIONES, IDIOMAS, itemDe } from './catalogos';

const GENEROS = {
  ACCION: 'Acción',
  COMEDIA: 'Comedia',
  DRAMA: 'Drama',
  TERROR: 'Terror',
  CIENCIA_FICCION: 'Ciencia ficción',
  ANIMACION: 'Animación',
  DOCUMENTAL: 'Documental',
};

const FORMATOS = {
  DOS_D: '2D',
  TRES_D: '3D',
  IMAX: 'IMAX',
  CUATRO_D: '4D',
  COMFORT: 'Comfort',
  PREMIUM: 'Premium',
  XD: 'XD',
};

export const ORDEN_FORMATOS = ['DOS_D', 'TRES_D', 'COMFORT', 'PREMIUM', 'XD', 'IMAX', 'CUATRO_D'];

export const FORMATOS_ESPECIALES = ['PREMIUM', 'XD', 'IMAX', 'CUATRO_D'];

const PESOS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function etiquetaGenero(genero) {
  return GENEROS[genero] ?? genero ?? '';
}

export function etiquetaFormato(formato) {
  return FORMATOS[formato] ?? formato ?? '';
}

export function formatearPrecio(monto) {
  return PESOS.format(Number(monto ?? 0));
}

export function formatearDuracion(minutos) {
  if (!minutos) return '';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto} min`;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

export function formatearDuracionCorta(minutos) {
  if (!minutos) return '';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto}m`;
  return resto ? `${horas}h ${resto}m` : `${horas}h`;
}

export function etiquetaClasificacion(clasificacion) {
  return itemDe(CLASIFICACIONES, clasificacion).texto;
}

export function clasificacionCompleta(clasificacion) {
  const item = itemDe(CLASIFICACIONES, clasificacion);
  return item.completo ?? item.texto;
}

export function edadDeClasificacion(clasificacion) {
  return itemDe(CLASIFICACIONES, clasificacion).edad ?? 0;
}

export function etiquetaIdioma(idioma) {
  return itemDe(IDIOMAS, idioma).texto;
}

export function etiquetaIdiomaCorta(idioma) {
  const item = itemDe(IDIOMAS, idioma);
  return item.corto ?? item.texto;
}

export function nombreCine(nombre) {
  return (nombre ?? '').replace(/^CineClick\s+/i, '');
}
