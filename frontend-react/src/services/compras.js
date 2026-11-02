import { api } from './http';

// CompraResponseDTO: { id, clienteId, clienteNombre, funcionId, peliculaTitulo, funcion, fechaCompra, subtotal,
//   total, codigoPromocion, estado: 'PENDIENTE_PAGO' | 'CONFIRMADA' | 'CANCELADA',
//   entradas: [{ id, codigoQr, fila, numeroButaca, codigoButaca, tipo, precioUnitario, estado }],
//   pago, expiraEn, segundosRestantes }
// expiraEn y segundosRestantes solo vienen mientras la reserva esta pendiente de pago.
// funcion (FuncionCompraDTO): { id, fechaHoraInicio, fechaHoraFin, formato, idioma, estado, peliculaId, peliculaTitulo,
//   urlPoster, clasificacion, cineId, cineNombre, salaNombre, provincia, localidad, calle, altura }

// entradas: [{ tipo: 'GENERAL' | 'MENOR' | 'JUBILADO', cantidad }]. La suma tiene que ser igual a la
// cantidad de butacas; el backend asigna los tipos a las butacas en el orden en que llegan.
export async function crearReserva({ clienteId, funcionId, butacasIds, entradas }) {
  const datos = { clienteId, funcionId, butacasIds, entradas };
  return api.post('/api/compras', datos);
}

// Todas las compras del cliente (confirmadas, pendientes y canceladas)
export async function getComprasDelCliente(clienteId) {
  return api.get(`/api/clientes/${clienteId}/compras`);
}

export async function getCompra(id) {
  return api.get(`/api/compras/${id}`);
}

export async function cancelarCompra(id) {
  return api.patch(`/api/compras/${id}/cancelar`);
}

export async function aplicarPromocion(id, codigo) {
  return api.post(`/api/compras/${id}/promocion`, { codigo });
}

// Solo viajan la marca y los ultimos 4 digitos. Devuelve PagoResponseDTO:
// { id, monto, metodoPago, estado: 'APROBADO' | 'RECHAZADO', fechaPago, codigoTransaccion, marcaTarjeta, ultimos4 }
// Un pago rechazado no es un error HTTP: llega con estado RECHAZADO.
export async function pagarCompra(id, { metodoPago, marca, ultimos4, aceptaTerminos }) {
  const datos = { metodoPago, marca, ultimos4, aceptaTerminos };
  return api.post(`/api/compras/${id}/pagos`, datos);
}
