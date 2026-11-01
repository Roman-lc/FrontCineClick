import { edadDeClasificacion } from '../../lib/formato';
// Estado de la compra en curso. Se guarda en sessionStorage para no perderlo al ir y volver entre
// pasos o al recargar: { funcionId, entradas: { GENERAL: 2, MENOR: 1 }, butacas: [{ id, codigo }],
// reserva: null | { compra: CompraResponseDTO, fin: ms en que vence segun el reloj de esta PC } }

const CLAVE = 'cineclick_compra';

export const MAXIMO_ENTRADAS = 10;

export function leerCompraGuardada() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function estadoInicial(funcionId) {
  const guardada = leerCompraGuardada();
  if (guardada && String(guardada.funcionId) === String(funcionId)) return guardada;
  return { funcionId: String(funcionId), entradas: {}, butacas: [], reserva: null };
}

export function guardarCompra(estado) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin storage la compra sigue funcionando, solo que se pierde al recargar
  }
}

export function borrarCompra() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar
  }
}

// segundosRestantes lo calcula el backend; se pasa a una hora de fin local para no depender
// de que el reloj de la PC coincida con el del servidor.
export function nuevaReserva(compra) {
  return { compra, fin: Date.now() + (compra.segundosRestantes ?? 0) * 1000 };
}

export function cantidadDeEntradas(entradas) {
  return Object.values(entradas).reduce((suma, cantidad) => suma + cantidad, 0);
}

// Lo que se manda al backend, en el orden de los tipos: [{ tipo: 'GENERAL', cantidad: 2 }]
export function entradasParaReservar(entradas, precios) {
  return precios.map((p) => ({ tipo: p.tipo, cantidad: entradas[p.tipo] ?? 0 })).filter((e) => e.cantidad > 0);
}

// Renglones del resumen: con reserva salen de lo que confirmo el backend; antes, de la eleccion del paso 1.
export function renglonesDeEntradas(estado, precios) {
  const nombre = (tipo) => precios.find((p) => p.tipo === tipo)?.nombre ?? tipo;
  if (estado.reserva) {
    const porTipo = new Map();
    for (const entrada of estado.reserva.compra.entradas) {
      const renglon = porTipo.get(entrada.tipo) ?? { tipo: entrada.tipo, nombre: nombre(entrada.tipo), cantidad: 0, subtotal: 0 };
      renglon.cantidad += 1;
      renglon.subtotal += Number(entrada.precioUnitario);
      porTipo.set(entrada.tipo, renglon);
    }
    return [...porTipo.values()];
  }
  return precios
    .filter((p) => estado.entradas[p.tipo] > 0)
    .map((p) => ({ tipo: p.tipo, nombre: p.nombre, cantidad: estado.entradas[p.tipo], subtotal: p.precio * estado.entradas[p.tipo] }));
}

export function formatearReloj(segundos) {
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}

// MAS_13 -> 13, ATP -> 0
export function edadMinima(clasificacion) {
  return edadDeClasificacion(clasificacion);
}

export function textoDeclaracionMenores(edad) {
  if (edad >= 18) return 'Declaro que todas las personas que asisten son mayores de 18 años.';
  return `Declaro que los menores de ${edad} años ingresan acompañados por un adulto responsable.`;
}

// ids de los campos de la tarjeta: PasoPago los usa para llevar el foco al primer error
export const IDS_CAMPOS = {
  numero: 'tarjeta-numero',
  vencimiento: 'tarjeta-vencimiento',
  codigo: 'tarjeta-codigo',
  titular: 'tarjeta-titular',
  dni: 'tarjeta-dni',
};
