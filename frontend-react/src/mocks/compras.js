import { ApiError } from '../services/http';
import { simular, simularNoEncontrado } from './simular';
import { funcionesMock } from './funciones';
import { butacasDeSala } from './salas';

// Simula las reglas del backend para la compra: reserva de 8 minutos, 409 si la butaca ya esta
// tomada, promocion ESTRENO10 y pago rechazado con la tarjeta terminada en 0002.
// Las compras viven en memoria: al recargar la pagina se pierden.

const MINUTOS_RESERVA = 8;
const ULTIMOS4_RECHAZADA = '0002';

// Igual que TipoEntrada del backend
const TIPOS_ENTRADA = [
  { tipo: 'GENERAL', nombre: 'General', seccion: 'Entradas', condiciones: 'Para cualquier persona, sin requisitos.', factor: 1 },
  { tipo: 'MENOR', nombre: 'Menor', seccion: 'Con descuento', condiciones: 'Menores de 12 años. Presentar DNI del menor en el ingreso.', factor: 0.7 },
  { tipo: 'JUBILADO', nombre: 'Jubilado', seccion: 'Con descuento', condiciones: 'Jubilados y pensionados. Presentar credencial y DNI en el ingreso.', factor: 0.6 },
];

const PROMOCIONES = { ESTRENO10: 10 };

const compras = new Map();
let proximoId = 5001;

// Para probar el 409: la primera vez que se intenta reservar la E7 de una funcion, "otra persona" la
// toma un instante antes. Al reintentar, el mapa ya la muestra ocupada.
const BUTACA_QUE_SE_OCUPA = 'E7';
const ocupadasDeRepente = new Set();

function buscarFuncion(funcionId) {
  return funcionesMock.find((f) => String(f.id) === String(funcionId));
}

// Las butacas vendidas "por otros" salen de butacasLibres y se eligen siempre igual para cada funcion,
// asi el mapa no cambia entre recargas.
function ocupadasPorOtros(funcion, butacas) {
  const vendidas = Math.max(0, funcion.capacidadSala - funcion.butacasLibres);
  const orden = (b) => (b.id * 7919 + funcion.id * 104729) % 997;
  const mezcladas = [...butacas].sort((a, b) => orden(a) - orden(b));
  return new Set(mezcladas.slice(0, vendidas).map((b) => b.id));
}

function cancelar(compra) {
  compra.estado = 'CANCELADA';
  compra.entradas.forEach((e) => (e.estado = 'CANCELADA'));
}

function vencerReservas() {
  for (const compra of compras.values()) {
    if (compra.estado === 'PENDIENTE_PAGO' && Date.now() >= compra.expiraMs) cancelar(compra);
  }
}

function reservadas(funcionId) {
  vencerReservas();
  const ids = new Set();
  for (const compra of compras.values()) {
    if (String(compra.funcionId) !== String(funcionId) || compra.estado === 'CANCELADA') continue;
    compra.entradas.forEach((e) => ids.add(e.butacaId));
  }
  return ids;
}

function butacasConEstado(funcion) {
  const butacas = butacasDeSala(funcion.salaId);
  const ocupadas = ocupadasPorOtros(funcion, butacas);
  const enReserva = reservadas(funcion.id);
  return butacas.map((b) => ({
    ...b,
    disponible: !ocupadas.has(b.id) && !enReserva.has(b.id) && !ocupadasDeRepente.has(`${funcion.id}-${b.id}`),
  }));
}

function precioDe(funcion, tipo) {
  const { factor } = TIPOS_ENTRADA.find((t) => t.tipo === tipo);
  return Math.round(funcion.precioBase * factor * 100) / 100;
}

function codigoEntrada() {
  const alfabeto = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
}

// Misma forma que CompraResponseDTO
function aDto(compra) {
  const subtotal = compra.entradas.reduce((suma, e) => suma + e.precioUnitario, 0);
  const descuento = compra.promocion ? Math.round(subtotal * PROMOCIONES[compra.promocion]) / 100 : 0;
  const pendiente = compra.estado === 'PENDIENTE_PAGO';
  return {
    id: compra.id,
    clienteId: compra.clienteId,
    clienteNombre: 'Ana Gómez',
    funcionId: compra.funcionId,
    peliculaTitulo: compra.peliculaTitulo,
    fechaCompra: new Date(compra.creadaMs).toISOString(),
    subtotal,
    total: subtotal - descuento,
    codigoPromocion: compra.promocion,
    estado: compra.estado,
    entradas: compra.entradas.map((e) => ({
      id: e.id,
      codigoQr: e.codigoQr,
      fila: e.fila,
      numeroButaca: e.numeroButaca,
      codigoButaca: e.codigoButaca,
      tipo: e.tipo,
      precioUnitario: e.precioUnitario,
      estado: e.estado,
    })),
    pago: compra.pago,
    expiraEn: pendiente ? new Date(compra.expiraMs).toISOString() : null,
    segundosRestantes: pendiente ? Math.max(0, Math.floor((compra.expiraMs - Date.now()) / 1000)) : null,
  };
}

async function fallar(status, mensaje, detalles = []) {
  await simular(null);
  throw new ApiError(status, mensaje, detalles);
}

function buscarCompra(id) {
  vencerReservas();
  return compras.get(Number(id));
}

export async function preciosMock(funcionId) {
  const funcion = buscarFuncion(funcionId);
  if (!funcion) return simularNoEncontrado(`Funcion no encontrada con id ${funcionId}`);
  return simular(
    TIPOS_ENTRADA.map(({ tipo, nombre, seccion, condiciones }) => ({ tipo, nombre, seccion, condiciones, precio: precioDe(funcion, tipo) }))
  );
}

export async function butacasMock(funcionId) {
  const funcion = buscarFuncion(funcionId);
  if (!funcion) return simularNoEncontrado(`Funcion no encontrada con id ${funcionId}`);
  return simular(butacasConEstado(funcion));
}

export async function crearReservaMock({ clienteId, funcionId, butacasIds, entradas }) {
  const funcion = buscarFuncion(funcionId);
  if (!funcion) return simularNoEncontrado(`Funcion no encontrada con id ${funcionId}`);
  if (butacasIds.length > 10) return fallar(400, 'Hay datos invalidos', ['butacasIds: no se pueden reservar mas de 10 butacas']);
  const cantidad = entradas.reduce((suma, e) => suma + e.cantidad, 0);
  if (cantidad !== butacasIds.length) {
    return fallar(400, `La cantidad de entradas (${cantidad}) no coincide con la cantidad de butacas elegidas (${butacasIds.length})`);
  }

  const butacas = butacasConEstado(funcion);
  const elegidas = butacasIds.map((id) => butacas.find((b) => b.id === id));
  if (elegidas.includes(undefined)) return simularNoEncontrado('Una o mas butacas solicitadas no existen');
  for (const butaca of elegidas) {
    const clave = `${funcion.id}-${butaca.id}`;
    if (butaca.codigo === BUTACA_QUE_SE_OCUPA && !ocupadasDeRepente.has(clave)) {
      ocupadasDeRepente.add(clave);
      return fallar(409, `La butaca ${butaca.codigo} ya no esta disponible`);
    }
    if (!butaca.disponible) return fallar(409, `La butaca ${butaca.codigo} ya no esta disponible`);
  }

  const tipos = entradas.flatMap((e) => Array(e.cantidad).fill(e.tipo));
  const ahora = Date.now();
  const id = proximoId++;
  const compra = {
    id,
    clienteId,
    funcionId: funcion.id,
    peliculaTitulo: funcion.peliculaTitulo,
    creadaMs: ahora,
    expiraMs: ahora + MINUTOS_RESERVA * 60_000,
    estado: 'PENDIENTE_PAGO',
    promocion: null,
    pago: null,
    entradas: elegidas.map((butaca, i) => ({
      id: id * 100 + i,
      butacaId: butaca.id,
      codigoQr: codigoEntrada(),
      fila: butaca.fila,
      numeroButaca: butaca.numero,
      codigoButaca: butaca.codigo,
      tipo: tipos[i],
      precioUnitario: precioDe(funcion, tipos[i]),
      estado: 'EMITIDA',
    })),
  };
  compras.set(id, compra);
  return simular(aDto(compra));
}

export async function getCompraMock(id) {
  const compra = buscarCompra(id);
  return compra ? simular(aDto(compra)) : simularNoEncontrado(`Compra no encontrada con id ${id}`);
}

export async function cancelarCompraMock(id) {
  const compra = buscarCompra(id);
  if (!compra) return simularNoEncontrado(`Compra no encontrada con id ${id}`);
  if (compra.estado === 'CANCELADA') return fallar(400, 'La compra ya se encuentra cancelada');
  cancelar(compra);
  return simular(aDto(compra));
}

export async function aplicarPromocionMock(id, codigo) {
  const compra = buscarCompra(id);
  if (!compra) return simularNoEncontrado(`Compra no encontrada con id ${id}`);
  if (compra.estado !== 'PENDIENTE_PAGO') return fallar(409, 'La reserva vencio o ya no esta activa');
  const clave = codigo.trim().toUpperCase();
  if (!PROMOCIONES[clave]) return simularNoEncontrado(`Promocion no encontrada con codigo ${codigo}`);
  compra.promocion = clave;
  return simular(aDto(compra));
}

export async function pagarCompraMock(id, { metodoPago, marca, ultimos4, aceptaTerminos }) {
  if (aceptaTerminos !== true) {
    return fallar(400, 'Hay datos invalidos', ['aceptaTerminos: hay que aceptar los terminos y condiciones']);
  }
  const compra = buscarCompra(id);
  if (!compra) return simularNoEncontrado(`Compra no encontrada con id ${id}`);
  if (compra.pago?.estado === 'APROBADO') return simular(compra.pago);
  if (compra.estado !== 'PENDIENTE_PAGO') return fallar(409, 'La reserva vencio o ya no esta activa');

  const aprobado = ultimos4 !== ULTIMOS4_RECHAZADA;
  compra.pago = {
    id: compra.id,
    monto: aDto(compra).total,
    metodoPago,
    estado: aprobado ? 'APROBADO' : 'RECHAZADO',
    fechaPago: new Date().toISOString(),
    codigoTransaccion: aprobado ? `TX-MOCK-${compra.id}` : null,
    marcaTarjeta: marca,
    ultimos4,
  };
  if (aprobado) compra.estado = 'CONFIRMADA';
  return simular(compra.pago);
}
