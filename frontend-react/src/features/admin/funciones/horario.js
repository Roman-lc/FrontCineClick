import { ahoraParaInput, horaCorta, sumarDiasISO } from '../../../lib/fechas';

export const HORAS = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '00', '01'];
export const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const MINUTOS_PUBLICIDAD = 15;
const MINUTOS_LIMPIEZA = 15;
const esTrasnoche = (hora) => Number(hora) < 10;

export function combinar(fecha, hora, minuto) {
  if (!fecha || hora === '' || minuto === '') return '';
  return `${esTrasnoche(hora) ? sumarDiasISO(fecha, 1) : fecha}T${hora}:${minuto}`;
}

export function separar(inicio) {
  const hora = inicio.slice(11, 13);
  const fecha = esTrasnoche(hora) ? sumarDiasISO(inicio, -1) : inicio.slice(0, 10);
  return { fecha, hora, minuto: inicio.slice(14, 16) };
}

export const diaDeLaGrilla = (inicio) => separar(inicio).fecha;

export function finEstimado(inicio, duracionMinutos) {
  return new Date(new Date(inicio).getTime() + (duracionMinutos + MINUTOS_PUBLICIDAD) * 60000);
}

export const tramo = (inicio, duracionMinutos) => `${horaCorta(inicio)} a ${horaCorta(finEstimado(inicio, duracionMinutos).toISOString())}`;

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
