import { diaRelativo, fechaDeFuncion, horaCorta, hoyISO } from '../../lib/fechas';
import { PROVINCIAS, itemDe } from '../../lib/catalogos';
import { ORDEN_FORMATOS } from '../../lib/formato';

// Tipos de sala que se muestran como formato (las tradicionales proyectan en 2D o 3D segun la funcion)
const FORMATO_DE_SALA = { PREMIUM: 'PREMIUM', IMAX: 'IMAX', CUATRO_D: 'CUATRO_D' };

// Formatos del cine sin repetir y en el orden fijo: los de sus funciones (2D, 3D...) mas los tipos de
// sala especiales. Si todavia no tiene funciones, las salas tradicionales cuentan como 2D.
export function formatosDelCine(cine, funcionesDelCine) {
  const formatos = new Set(funcionesDelCine.filter((f) => f.estado !== 'CANCELADA').map((f) => f.formato));
  for (const sala of cine.salas.filter((s) => s.activa !== false)) {
    if (FORMATO_DE_SALA[sala.tipo]) formatos.add(FORMATO_DE_SALA[sala.tipo]);
    else if (funcionesDelCine.length === 0) formatos.add('DOS_D');
  }
  return [...formatos].sort((a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b));
}

// Horario del dia a partir de las funciones (el modelo no tiene horario de apertura):
// - abierto: hay una funcion en curso o alguna mas tarde hoy
// - texto: "Hoy: funciones de 13:20 a 23:50" o, si ya no quedan, "Próxima función: mañana 13:20"
export function horarioDelCine(funcionesDelCine, ahora = new Date()) {
  const activas = funcionesDelCine
    .filter((f) => f.estado !== 'CANCELADA' && f.estado !== 'FINALIZADA')
    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio));
  const hoy = hoyISO();
  const deHoy = activas.filter((f) => fechaDeFuncion(f) === hoy);
  const abierto = deHoy.some((f) => new Date(f.fechaHoraFin ?? f.fechaHoraInicio) > ahora);

  if (abierto) {
    const primera = horaCorta(deHoy[0].fechaHoraInicio);
    const ultima = horaCorta(deHoy[deHoy.length - 1].fechaHoraInicio);
    return { abierto, texto: primera === ultima ? `Hoy: función a las ${primera}` : `Hoy: funciones de ${primera} a ${ultima}` };
  }
  const proxima = activas.find((f) => new Date(f.fechaHoraInicio) > ahora);
  if (!proxima) return { abierto, texto: 'Sin funciones programadas' };
  return { abierto, texto: `Próxima función: ${diaRelativo(proxima.fechaHoraInicio).toLowerCase()} ${horaCorta(proxima.fechaHoraInicio)}` };
}

// "Av. Corrientes 3247"
export function direccionCine(cine) {
  return [cine.calle, cine.altura].filter(Boolean).join(' ');
}

// "Balvanera, CABA" o "San Isidro, Buenos Aires"
export function ubicacionCine(cine) {
  const provincia = cine.provincia ? itemDe(PROVINCIAS, cine.provincia) : null;
  return [cine.localidad, provincia?.corto ?? provincia?.texto].filter(Boolean).join(', ');
}

// Para el mapa y "Cómo llegar": "calle altura, localidad, provincia", con el nombre completo de la provincia
const direccionParaMapa = (cine) =>
  [direccionCine(cine), cine.localidad, cine.provincia && itemDe(PROVINCIAS, cine.provincia).texto, 'Argentina']
    .filter(Boolean)
    .join(', ');

export function urlComoLlegar(cine) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionParaMapa(cine))}`;
}

export function urlMapaEmbebido(cine) {
  return `https://www.google.com/maps?q=${encodeURIComponent(direccionParaMapa(cine))}&output=embed`;
}

// El telefono se guarda con 10 digitos: "1140001000" -> "tel:+541140001000"
export function enlaceTelefono(telefono) {
  return `tel:+54${telefono}`;
}
