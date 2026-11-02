import { api } from './http';

// Endpoints del panel. Van siempre contra la API (no tienen mocks): el panel necesita
// el backend corriendo. Los listados piden tambien lo inactivo.

export const adminCines = {
  listar: () => api.get('/api/cines?incluirInactivos=true'),
  crear: (datos) => api.post('/api/cines', datos),
  modificar: (id, datos) => api.put(`/api/cines/${id}`, datos),
  cambiarEstado: (id, activo) => api.patch(`/api/cines/${id}/estado`, { activo }),
  eliminar: (id) => api.delete(`/api/cines/${id}`),
};

export const adminSalas = {
  listar: () => api.get('/api/salas'),
  crear: (cineId, datos) => api.post(`/api/cines/${cineId}/salas`, datos),
  modificar: (id, datos) => api.put(`/api/salas/${id}`, datos),
  cambiarEstado: (id, activo) => api.patch(`/api/salas/${id}/estado`, { activo }),
  eliminar: (id) => api.delete(`/api/salas/${id}`),
};

export const adminPeliculas = {
  listar: () => api.get('/api/peliculas?incluirInactivas=true'),
  crear: (datos) => api.post('/api/peliculas', datos),
  modificar: (id, datos) => api.put(`/api/peliculas/${id}`, datos),
  cambiarEstado: (id, activo) => api.patch(`/api/peliculas/${id}/estado`, { activo }),
  eliminar: (id) => api.delete(`/api/peliculas/${id}`),
};

export const adminFunciones = {
  listar: () => api.get('/api/funciones?incluirInactivos=true'),
  crear: (datos) => api.post('/api/funciones', datos),
  modificar: (id, datos) => api.put(`/api/funciones/${id}`, datos),
  cancelar: (id) => api.patch(`/api/funciones/${id}/cancelar`),
  eliminar: (id) => api.delete(`/api/funciones/${id}`),
};

export const adminPromociones = {
  listar: () => api.get('/api/promociones'),
  crear: (datos) => api.post('/api/promociones', datos),
  modificar: (id, datos) => api.put(`/api/promociones/${id}`, datos),
  cambiarEstado: (id, activo) => api.patch(`/api/promociones/${id}/estado`, { activo }),
  eliminar: (id) => api.delete(`/api/promociones/${id}`),
};

// Metricas del panel (MetricasResponseDTO). El backend solo responde a un administrador: el id del usuario
// viaja en X-Usuario-Id (la API no tiene sesiones; es un control basico, no una autenticacion real).
export function getMetricas({ desde, hasta, cineId }, usuarioId) {
  const filtroCine = cineId ? `&cineId=${cineId}` : '';
  return api.get(`/api/admin/metricas?desde=${desde}&hasta=${hasta}${filtroCine}`, { headers: { 'X-Usuario-Id': String(usuarioId) } });
}

// Solicitudes publicas: arrepentimientos (aprobar o rechazar las que quedaron fuera de plazo) y soporte
const comoAdmin = (usuarioId) => ({ headers: { 'X-Usuario-Id': String(usuarioId) } });
export const adminArrepentimientos = {
  listar: (usuarioId) => api.get('/api/admin/arrepentimientos', comoAdmin(usuarioId)),
  aprobar: (id, usuarioId) => api.patch(`/api/admin/arrepentimientos/${id}/aprobar`, undefined, comoAdmin(usuarioId)),
  rechazar: (id, usuarioId) => api.patch(`/api/admin/arrepentimientos/${id}/rechazar`, undefined, comoAdmin(usuarioId)),
};
export const adminSoporte = {
  listar: (usuarioId) => api.get('/api/admin/soporte', comoAdmin(usuarioId)),
  resolver: (id, usuarioId) => api.patch(`/api/admin/soporte/${id}/resolver`, undefined, comoAdmin(usuarioId)),
};

// Control de ingreso: marca la entrada como usada si es de esa funcion y esta pagada.
// ValidacionEntradaResponseDTO: { resultado: 'VALIDA' | 'YA_USADA' | 'OTRA_FUNCION' | 'NO_CONFIRMADA', codigo,
//   funcionId, peliculaTitulo, cineNombre, salaNombre, fechaHoraInicio, codigoButaca }. Un codigo que no existe da 404.
export function validarEntrada(codigo, funcionId) {
  return api.post(`/api/entradas/${encodeURIComponent(codigo)}/validar`, { funcionId: Number(funcionId) });
}
