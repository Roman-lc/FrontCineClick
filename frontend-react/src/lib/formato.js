// Textos para mostrar los enums y montos que llegan del backend.

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

// Orden fijo para mostrar formatos de funcion y tipos de sala juntos (Comfort y XD todavia no existen
// en el backend, pero quedan ubicados para cuando se agreguen)
export const ORDEN_FORMATOS = ['DOS_D', 'TRES_D', 'COMFORT', 'PREMIUM', 'XD', 'IMAX', 'CUATRO_D'];

// Formatos que se muestran con mas presencia (BadgeFormato destacado)
export const FORMATOS_ESPECIALES = ['PREMIUM', 'XD', 'IMAX', 'CUATRO_D'];

const PESOS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

// Si llega un valor que no esta en la tabla se muestra tal cual, para no ocultar datos nuevos del backend.
export function etiquetaGenero(genero) {
  return GENEROS[genero] ?? genero ?? '';
}

export function etiquetaFormato(formato) {
  return FORMATOS[formato] ?? formato ?? '';
}

export function formatearPrecio(monto) {
  return PESOS.format(Number(monto ?? 0));
}

// 169 -> "2 h 49 min", 45 -> "45 min"
export function formatearDuracion(minutos) {
  if (!minutos) return '';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto} min`;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

// Version compacta para las etiquetas sobre el poster: 132 -> "2h 12m", 45 -> "45m"
export function formatearDuracionCorta(minutos) {
  if (!minutos) return '';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto}m`;
  return resto ? `${horas}h ${resto}m` : `${horas}h`;
}

// Clasificacion: MAS_13 -> "+13" (etiqueta) y "Apta para mayores de 13 años" (completa)
export function etiquetaClasificacion(clasificacion) {
  return itemDe(CLASIFICACIONES, clasificacion).texto;
}

export function clasificacionCompleta(clasificacion) {
  const item = itemDe(CLASIFICACIONES, clasificacion);
  return item.completo ?? item.texto;
}

// Edad minima de la clasificacion (0 para ATP o si no se conoce)
export function edadDeClasificacion(clasificacion) {
  return itemDe(CLASIFICACIONES, clasificacion).edad ?? 0;
}

// Idioma: CASTELLANO -> "Castellano" (o "Cast." en la version corta)
export function etiquetaIdioma(idioma) {
  return itemDe(IDIOMAS, idioma).texto;
}

export function etiquetaIdiomaCorta(idioma) {
  const item = itemDe(IDIOMAS, idioma);
  return item.corto ?? item.texto;
}

// Dentro de la app los cines se muestran sin la marca: "CineClick Abasto" -> "Abasto".
// El nombre completo queda para los documentos (entradas, mails).
export function nombreCine(nombre) {
  return (nombre ?? '').replace(/^CineClick\s+/i, '');
}
