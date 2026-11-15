import { fechaCorta, horaCorta, hoyISO } from '../../../lib/fechas';
import { nombreCine } from '../../../lib/formato';

export function extraerCodigo(texto) {
  const crudo = String(texto ?? '').trim().toUpperCase();
  if (/[/?=#&]/.test(crudo)) {
    const partes = crudo
      .split(/[^0-9A-Z-]+/)
      .map((p) => p.replace(/-/g, ''))
      .filter((p) => p.length === 8);
    if (partes.length) return partes[partes.length - 1];
  }
  return crudo.replace(/[\s-]/g, '');
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function cuando(iso) {
  const fecha = iso.slice(0, 10);
  return fecha === hoyISO() ? `hoy a las ${horaCorta(iso)}` : `el ${fechaCorta(fecha)} a las ${horaCorta(iso)}`;
}

function diaYHora(iso) {
  const fecha = iso.slice(0, 10);
  return `el ${DIAS[new Date(`${fecha}T00:00:00`).getDay()]} ${fechaCorta(fecha)} a las ${horaCorta(iso)}`;
}

export const AVISO_TIPO = { MENOR: 'Pedir DNI del menor', JUBILADO: 'Pedir credencial de jubilado' };

export function textoResultado(r) {
  switch (r.resultado) {
    case 'VALIDA':
      return { titulo: 'Entrada válida', ok: true };
    case 'YA_USADA':
      return { titulo: r.usadaEn ? `Esta entrada ya se usó ${cuando(r.usadaEn)}` : 'Esta entrada ya se usó', ok: false };
    case 'OTRO_CINE':
      return { titulo: `Esta entrada es para ${nombreCine(r.cineNombre)}, no para este cine`, ok: false };
    case 'FUERA_DE_HORARIO':
      if (r.motivo === 'DEMASIADO_TEMPRANO') {
        return { titulo: `La función es a las ${horaCorta(r.fechaHoraInicio)}; el ingreso se habilita a las ${horaCorta(r.ingresoDesde)}`, ok: false };
      }
      if (r.motivo === 'FUNCION_TERMINADA') return { titulo: 'Esta función ya terminó', ok: false };
      return { titulo: `Esta entrada es para ${diaYHora(r.fechaHoraInicio)}`, ok: false };
    case 'ANULADA':
      return { titulo: 'Esta entrada fue anulada', ok: false };
    case 'NO_EXISTE':
      return { titulo: 'No encontramos ese código. Revisá que esté bien escrito', ok: false };
    default:
      return { titulo: 'No se pudo validar. Revisá la conexión e intentá de nuevo', ok: false };
  }
}

export const RESUMEN = {
  VALIDA: 'Válida',
  YA_USADA: 'Ya usada',
  OTRO_CINE: 'Otro cine',
  FUERA_DE_HORARIO: 'Fuera de horario',
  ANULADA: 'Anulada',
  NO_EXISTE: 'No existe',
  ERROR: 'Error',
};
