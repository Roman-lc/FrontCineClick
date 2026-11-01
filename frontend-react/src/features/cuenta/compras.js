// Estado de una compra tal como lo ve el cliente, y textos y archivos que se arman a partir de ella.

// - Cancelada: la compra se cancelo, la reserva vencio sin pagarse o se cancelo la funcion
// - Usada: todas sus entradas ya pasaron por el control de ingreso
// - Función pasada: la funcion ya empezo y las entradas no se usaron (todas)
// - Próxima: confirmada y la funcion todavia no empezo
// Una reserva pendiente de pago que sigue vigente es una compra en curso: no se lista (null).
export function estadoDeCompra(compra, ahora = new Date()) {
  const funcion = compra.funcion;
  if (compra.estado === 'PENDIENTE_PAGO' && compra.segundosRestantes > 0) return null;
  if (compra.estado !== 'CONFIRMADA' || funcion?.estado === 'CANCELADA') return { clave: 'cancelada', texto: 'Cancelada' };
  const entradas = compra.entradas ?? [];
  if (entradas.length > 0 && entradas.every((e) => e.estado === 'USADA')) return { clave: 'usada', texto: 'Usada' };
  if (funcion && new Date(funcion.fechaHoraInicio) <= ahora) return { clave: 'pasada', texto: 'Función pasada' };
  return { clave: 'proxima', texto: 'Próxima' };
}

// "1 entrada · Butaca D4" / "3 entradas · Butacas D4, D5 y D6"
export function textoEntradas(entradas) {
  const butacas = entradas.map((e) => e.codigoButaca);
  const lista = butacas.length > 1 ? `${butacas.slice(0, -1).join(', ')} y ${butacas[butacas.length - 1]}` : butacas[0];
  const cantidad = `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'}`;
  return butacas.length ? `${cantidad} · ${butacas.length === 1 ? 'Butaca' : 'Butacas'} ${lista}` : cantidad;
}

export const NOMBRES_TIPO = { GENERAL: 'General', MENOR: 'Menor', JUBILADO: 'Jubilado' };

// Lo que hay que mostrar en el ingreso para las entradas con descuento
export const REQUISITO_TIPO = {
  MENOR: 'Presentá el DNI del menor.',
  JUBILADO: 'Presentá la credencial de jubilado o pensionado.',
};

// ---------- Archivo .ics (calendario) ----------

// Fecha en UTC con el formato de iCalendar: 20261031T170000Z
const fechaIcs = (fecha) => fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// En los textos de iCalendar se escapan la barra, la coma, el punto y coma y los saltos de linea
const textoIcs = (texto) => String(texto).replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

// Arma el evento de la funcion (sin librerias) y lo descarga como cineclick-compra-N.ics
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
