import { api } from './http';

// Endpoints del panel. Solo responden a un administrador: http.js manda el id del usuario en X-Usuario-Id
// (la API no tiene tokens; es un control basico, no una autenticacion real). Los listados piden tambien lo inactivo.

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

// Metricas del panel (MetricasResponseDTO)
export function getMetricas({ desde, hasta, cineId }) {
  const filtroCine = cineId ? `&cineId=${cineId}` : '';
  return api.get(`/api/admin/metricas?desde=${desde}&hasta=${hasta}${filtroCine}`);
}

// Compras de todos los clientes, solo lectura. Filtros opcionales: codigo (N° de compra o codigo de entrada), email,
// cineId, estado, desde y hasta ('yyyy-mm-dd', por fecha de compra), pagina (desde 0) y tamano.
// Devuelve PaginaDTO { contenido: [CompraAdminDTO], pagina, tamano, totalElementos, totalPaginas }.
export const adminCompras = {
  buscar: (filtros) => {
    const query = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    return api.get(`/api/admin/compras?${query}`);
  },
  // DetalleCompraAdminDTO: { compra (CompraResponseDTO), clienteEmail, promocion, arrepentimiento, consultas }
  detalle: (id) => api.get(`/api/admin/compras/${id}`),
};

// Solicitudes publicas: arrepentimientos (aprobar o rechazar las que quedaron fuera de plazo) y soporte
export const adminArrepentimientos = {
  listar: () => api.get('/api/admin/arrepentimientos'),
  aprobar: (id) => api.patch(`/api/admin/arrepentimientos/${id}/aprobar`),
  rechazar: (id) => api.patch(`/api/admin/arrepentimientos/${id}/rechazar`),
};
export const adminSoporte = {
  listar: () => api.get('/api/admin/soporte'),
  resolver: (id) => api.patch(`/api/admin/soporte/${id}/resolver`),
};

// Control de ingreso: el codigo alcanza (el backend deduce pelicula, sala, butaca y horario) y el cine del puesto.
// ValidacionEntradaResponseDTO: { resultado: 'VALIDA' | 'YA_USADA' | 'OTRO_CINE' | 'FUERA_DE_HORARIO' | 'ANULADA',
//   motivo: 'DEMASIADO_TEMPRANO' | 'FUNCION_TERMINADA' | 'OTRO_DIA' (solo FUERA_DE_HORARIO), codigo, peliculaTitulo,
//   cineId, cineNombre, salaNombre, codigoButaca, fechaHoraInicio, tipo, usadaEn, ingresoDesde, ingresoHasta }.
// 200 para todo codigo que existe (solo VALIDA la marca como usada); 404 si no existe.
export function validarEntrada(codigo, cineId) {
  return api.post(`/api/entradas/${encodeURIComponent(codigo)}/validar`, { cineId: Number(cineId) });
}
