import { api } from './http';

export async function crearReserva({ clienteId, funcionId, butacasIds, entradas }) {
  const datos = { clienteId, funcionId, butacasIds, entradas };
  return api.post('/api/compras', datos);
}

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

export async function pagarCompra(id, { metodoPago, marca, ultimos4, aceptaTerminos, recibirNovedades }) {
  const datos = { metodoPago, marca, ultimos4, aceptaTerminos, recibirNovedades: recibirNovedades === true };
  return api.post(`/api/compras/${id}/pagos`, datos);
}
