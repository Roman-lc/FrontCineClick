import { ahoraParaInput, horaCorta, sumarDiasISO } from '../../../lib/fechas';

// Horario de una funcion en el formulario del panel: fecha, hora y minutos por separado. Con selects no se puede
// elegir un horario que no termine en 0 o 5 (la regla del backend). Las 00 y 01 son la trasnoche del dia
// elegido: la funcion queda en el dia siguiente.
export const HORAS = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '00', '01'];
export const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

// Igual que el seed del backend: el fin estimado suma la publicidad y entre funciones se deja la limpieza
const MINUTOS_PUBLICIDAD = 15;
const MINUTOS_LIMPIEZA = 15;
const esTrasnoche = (hora) => Number(hora) < 10;

// '2026-11-02', '00', '30' -> '2026-11-03T00:30' ('' si falta algo)
export function combinar(fecha, hora, minuto) {
  if (!fecha || hora === '' || minuto === '') return '';
  return `${esTrasnoche(hora) ? sumarDiasISO(fecha, 1) : fecha}T${hora}:${minuto}`;
}

// Inverso de combinar, para editar una funcion
export function separar(inicio) {
  const hora = inicio.slice(11, 13);
  const fecha = esTrasnoche(hora) ? sumarDiasISO(inicio, -1) : inicio.slice(0, 10);
  return { fecha, hora, minuto: inicio.slice(14, 16) };
}

// Dia de la grilla al que pertenece una funcion (las de trasnoche cuentan para el dia anterior)
export const diaDeLaGrilla = (inicio) => separar(inicio).fecha;

export function finEstimado(inicio, duracionMinutos) {
  return new Date(new Date(inicio).getTime() + (duracionMinutos + MINUTOS_PUBLICIDAD) * 60000);
}

export const tramo = (inicio, duracionMinutos) => `${horaCorta(inicio)} a ${horaCorta(finEstimado(inicio, duracionMinutos).toISOString())}`;

// Primer horario libre despues de la ultima funcion del dia: fin estimado + limpieza, redondeado hacia arriba a
// multiplos de 10. Si el dia es hoy, nunca antes de ahora. null si ya no entra en la grilla (despues de las 01:55).
export function siguienteLibre(funcionesDelDia, duracionDe, fecha) {
  const ultima = funcionesDelDia[funcionesDelDia.length - 1];
  let desde = ultima ? new Date(finEstimado(ultima.fechaHoraInicio, duracionDe(ultima)).getTime() + MINUTOS_LIMPIEZA * 60000) : new Date(`${fecha}T13:00:00`);
  const pronto = new Date(Date.now() + 10 * 60000);
  if (desde < pronto) desde = pronto;
  const redondeado = new Date(Math.ceil(desde.getTime() / 600000) * 600000);
  const { fecha: dia, hora, minuto } = separar(ahoraParaInput(redondeado));
  if (dia !== fecha || !HORAS.includes(hora)) return null;
  return { hora, minuto };
}
