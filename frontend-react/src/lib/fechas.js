// Vigente = no cancelada ni finalizada y todavia no empezo.
export function funcionVigente(funcion) {
  if (!funcion) return false;
  if (funcion.estado === 'CANCELADA' || funcion.estado === 'FINALIZADA') return false;
  const inicio = new Date(funcion.fechaHoraInicio);
  if (Number.isNaN(inicio.getTime())) return false;
  if (inicio <= new Date()) return false;
  return true;
}

export function fechaCorta(fechaIso) {
  const d = new Date(fechaIso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) {
    const d2 = new Date(fechaIso);
    return d2.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

// hourCycle 'h23' fuerza 24 h: con es-AR algunos navegadores muestran "02:00 p. m."
export function horaCorta(fechaIso) {
  const d = new Date(fechaIso);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

export function fechaHoraCorta(fechaIso) {
  const d = new Date(fechaIso);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

export function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function sumarDiasISO(iso, dias) {
  const base = iso.includes('T') ? iso.split('T')[0] : iso;
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function diaSemanaCorto(iso) {
  const base = iso.includes('T') ? iso.split('T')[0] : iso;
  const d = new Date(base + 'T00:00:00');
  return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
}

export function etiquetaFecha(iso) {
  const hoy = hoyISO();
  const man = sumarDiasISO(hoy, 1);
  if (iso === hoy) return `Hoy · ${fechaCorta(iso)}`;
  if (iso === man) return `Mañana · ${fechaCorta(iso)}`;
  return `${diaSemanaCorto(iso)} · ${fechaCorta(iso)}`;
}

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// '2026-10-31' -> { dia: 'SÁB', fecha: '31/OCT' }
export function diaYFechaCortos(iso) {
  const d = new Date(iso + 'T00:00:00');
  return { dia: diaSemanaCorto(iso).toUpperCase(), fecha: `${d.getDate()}/${MESES_CORTOS[d.getMonth()]}` };
}

// '2026-10-23' -> '23 de octubre de 2026'
export function fechaLarga(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fechaDeFuncion(funcion) {
  if (!funcion || !funcion.fechaHoraInicio) return '';
  return funcion.fechaHoraInicio.split('T')[0];
}
