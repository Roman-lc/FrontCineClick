// Textos para mostrar los enums y montos que llegan del backend.

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
};

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

// El backend manda los formatos como un Set (sin orden fijo): ['IMAX', 'DOS_D'] -> "2D · IMAX"
export function listarFormatos(formatos = []) {
  const orden = Object.keys(FORMATOS);
  return [...formatos]
    .sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
    .map(etiquetaFormato)
    .join(' · ');
}

const CLASIFICACIONES = {
  ATP: 'Apta para todo público',
  '+13': 'Apta para mayores de 13 años',
  '+16': 'Apta para mayores de 16 años',
  '+18': 'Apta para mayores de 18 años',
};

export function clasificacionCompleta(clasificacion) {
  return CLASIFICACIONES[clasificacion] ?? clasificacion ?? '';
}

const IDIOMAS_CORTOS = { Castellano: 'Cast.', Subtitulada: 'Subt.' };

export function etiquetaIdiomaCorta(idioma) {
  return IDIOMAS_CORTOS[idioma] ?? idioma ?? '';
}
