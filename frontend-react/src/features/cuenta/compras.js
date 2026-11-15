export function estadoDeCompra(compra, ahora = new Date()) {
  const funcion = compra.funcion;
  if (compra.estado === 'PENDIENTE_PAGO' && compra.segundosRestantes > 0) return null;
  if (compra.estado === 'ARREPENTIDA') return { clave: 'cancelada', texto: 'Arrepentida' };
  if (compra.estado !== 'CONFIRMADA' || funcion?.estado === 'CANCELADA') return { clave: 'cancelada', texto: 'Cancelada' };
  const entradas = compra.entradas ?? [];
  if (entradas.length > 0 && entradas.every((e) => e.estado === 'USADA')) return { clave: 'usada', texto: 'Usada' };
  if (funcion && new Date(funcion.fechaHoraInicio) <= ahora) return { clave: 'pasada', texto: 'Función pasada' };
  return { clave: 'proxima', texto: 'Próxima' };
}

export function textoEntradas(entradas) {
  const butacas = entradas.map((e) => e.codigoButaca);
  const lista = butacas.length > 1 ? `${butacas.slice(0, -1).join(', ')} y ${butacas[butacas.length - 1]}` : butacas[0];
  const cantidad = `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'}`;
  return butacas.length ? `${cantidad} · ${butacas.length === 1 ? 'Butaca' : 'Butacas'} ${lista}` : cantidad;
}

export const NOMBRES_TIPO = { GENERAL: 'General', MENOR: 'Menor', JUBILADO: 'Jubilado' };

export const REQUISITO_TIPO = {
  MENOR: 'Presentá el DNI del menor.',
  JUBILADO: 'Presentá la credencial de jubilado o pensionado.',
};

const fechaIcs = (fecha) => fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const textoIcs = (texto) => String(texto).replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function descargarCalendario({ compra, funcion, direccion }) {
  const inicio = new Date(funcion.fechaHoraInicio);
  const fin = funcion.fechaHoraFin ? new Date(funcion.fechaHoraFin) : new Date(inicio.getTime() + 2 * 3600000);
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CineClick//Entradas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:compra-${compra.id}@cineclick`,
    `DTSTAMP:${fechaIcs(new Date())}`,
    `DTSTART:${fechaIcs(inicio)}`,
    `DTEND:${fechaIcs(fin)}`,
    `SUMMARY:${textoIcs(`${funcion.peliculaTitulo} en ${funcion.cineNombre}`)}`,
    `LOCATION:${textoIcs([funcion.cineNombre, direccion].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${textoIcs(`${funcion.salaNombre}. ${textoEntradas(compra.entradas)}. Compra N° ${compra.id}.`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${textoIcs(`${funcion.peliculaTitulo} empieza en una hora`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const archivo = new Blob([lineas.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `cineclick-compra-${compra.id}.ics`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
