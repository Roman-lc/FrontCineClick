import { ApiError } from '../services/http';
import { simular } from './simular';
import { comprasDelClienteMock } from './compras';

// Simula la busqueda y las solicitudes con las compras de ejemplo del cliente demo (cliente@cineclick.com).
const EMAIL_DEMO = 'cliente@cineclick.com';
const solicitudes = new Map();
const alfabeto = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
const codigo = (prefijo) => prefijo + Array.from({ length: 8 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');

async function compraDe(email, texto) {
  const limpio = String(texto ?? '').replace(/[\s-]/g, '').toUpperCase();
  const compras = await comprasDelClienteMock(1);
  const compra = compras.find((c) => String(c.id) === limpio || c.entradas.some((e) => e.codigoQr === limpio));
  if (!compra || email.trim().toLowerCase() !== EMAIL_DEMO) {
    throw new ApiError(404, 'No encontramos una compra con esos datos. Revisá el email con el que compraste');
  }
  return compra;
}

function elegibilidad(compra) {
  if (solicitudes.has(compra.id)) return [false, 'Ya te arrepentiste de esta compra'];
  if (compra.estado !== 'CONFIRMADA') return [false, 'La compra no está confirmada'];
  const inicio = new Date(compra.funcion.fechaHoraInicio).getTime();
  if (inicio <= Date.now()) return [false, 'La función ya pasó'];
  if (inicio - 3600000 < Date.now()) return [false, 'La función empieza en menos de 60 minutos'];
  return [true, null];
}

export async function buscarCompraMock(email, texto) {
  const compra = await compraDe(email, texto);
  const [elegible, motivo] = elegibilidad(compra);
  return simular({
    compraId: compra.id,
    peliculaTitulo: compra.funcion.peliculaTitulo,
    fechaHoraInicio: compra.funcion.fechaHoraInicio,
    cineNombre: compra.funcion.cineNombre,
    salaNombre: compra.funcion.salaNombre,
    cantidadEntradas: compra.entradas.length,
    total: compra.total,
    estado: compra.estado,
    fechaCompra: compra.fechaCompra,
    elegibleArrepentimiento: elegible,
    motivoNoElegible: motivo,
    codigoArrepentimiento: solicitudes.get(compra.id)?.codigo ?? null,
  });
}

export async function enviarArrepentimientoMock(datos) {
  const compra = await compraDe(datos.email, datos.codigo);
  if (!solicitudes.has(compra.id)) {
    const [elegible, motivo] = elegibilidad(compra);
    solicitudes.set(compra.id, {
      codigo: codigo('ARR-'),
      estado: elegible ? 'APROBADA' : 'FUERA_DE_PLAZO',
      motivoFueraDePlazo: motivo,
      montoReembolso: elegible ? compra.total : null,
      compraId: compra.id,
      peliculaTitulo: compra.funcion.peliculaTitulo,
    });
  }
  return simular(solicitudes.get(compra.id));
}

const consultas = new Map();
export async function enviarSoporteMock(datos) {
  if (datos.codigo) await compraDe(datos.email, datos.codigo);
  if (!consultas.has(datos.claveIdempotencia)) consultas.set(datos.claveIdempotencia, { numero: codigo('SOP-'), estado: 'ABIERTA' });
  return simular(consultas.get(datos.claveIdempotencia));
}
