import { diaRelativo, fechaDeFuncion, horaCorta, hoyISO } from '../../lib/fechas';
import { PROVINCIAS, itemDe } from '../../lib/catalogos';
import { ORDEN_FORMATOS } from '../../lib/formato';

const FORMATO_DE_SALA = { PREMIUM: 'PREMIUM', IMAX: 'IMAX', CUATRO_D: 'CUATRO_D' };

export function formatosDelCine(cine, funcionesDelCine) {
  const formatos = new Set(funcionesDelCine.filter((f) => f.estado !== 'CANCELADA').map((f) => f.formato));
  for (const sala of cine.salas.filter((s) => s.activa !== false)) {
    if (FORMATO_DE_SALA[sala.tipo]) formatos.add(FORMATO_DE_SALA[sala.tipo]);
    else if (funcionesDelCine.length === 0) formatos.add('DOS_D');
  }
  return [...formatos].sort((a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b));
}

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

export function direccionCine(cine) {
  return [cine.calle, cine.altura].filter(Boolean).join(' ');
}

export function ubicacionCine(cine) {
  const provincia = cine.provincia ? itemDe(PROVINCIAS, cine.provincia) : null;
  return [cine.localidad, provincia?.corto ?? provincia?.texto].filter(Boolean).join(', ');
}

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

export function enlaceTelefono(telefono) {
  return `tel:+54${telefono}`;
}
