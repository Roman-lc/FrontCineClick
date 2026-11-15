import { api } from './http';

export async function getFunciones({ peliculaId, cineId, fecha, desde } = {}) {
  const query = new URLSearchParams();
  if (peliculaId) query.set('peliculaId', peliculaId);
  if (cineId) query.set('cineId', cineId);
  if (fecha) query.set('fecha', fecha);
  if (desde) query.set('desde', desde);
  const qs = query.toString();
  return api.get(`/api/funciones${qs ? `?${qs}` : ''}`);
}

export async function getCombinables(id) {
  return api.get(`/api/funciones/${id}/combinables`);
}

export async function getFuncion(id) {
  return api.get(`/api/funciones/${id}`);
}

export async function getButacas(funcionId) {
  return api.get(`/api/funciones/${funcionId}/butacas-disponibles`);
}

export async function getPrecios(funcionId) {
  return api.get(`/api/funciones/${funcionId}/precios`);
}
