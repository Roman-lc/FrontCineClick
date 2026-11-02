import { api } from './http';

// FuncionResponseDTO: { id, peliculaId, peliculaTitulo, cineId, cineNombre, salaId, salaNombre,
//   fechaHoraInicio, fechaHoraFin (sin zona horaria: hora local del cine), precioBase, formato,
//   idioma, estado, butacasLibres, capacidadSala }

// Filtros opcionales, igual que el backend: peliculaId, cineId y fecha ('yyyy-mm-dd').
export async function getFunciones({ peliculaId, cineId, fecha } = {}) {
  const query = new URLSearchParams();
  if (peliculaId) query.set('peliculaId', peliculaId);
  if (cineId) query.set('cineId', cineId);
  if (fecha) query.set('fecha', fecha);
  const qs = query.toString();
  return api.get(`/api/funciones${qs ? `?${qs}` : ''}`);
}

// Doble funcion: CombinablesResponseDTO { elegida: { funcionId, pelicula, inicio, finEstimado }, antes: [...],
//   despues: [...] } con { funcionId, pelicula, urlPoster, formato, idioma, sala, inicio, finEstimado, minutosEntre,
//   butacasLibres }. El fin es estimado (inicio + duracion + publicidad).
export async function getCombinables(id) {
  return api.get(`/api/funciones/${id}/combinables`);
}

export async function getFuncion(id) {
  return api.get(`/api/funciones/${id}`);
}

// ButacaResponseDTO: { id, fila, numero, columna, codigo, tipo: 'NORMAL' | 'VIP' | 'DISCAPACIDAD', disponible }
// columna es la posicion en el plano de la sala: los numeros que faltan son pasillos o huecos.
export async function getButacas(funcionId) {
  return api.get(`/api/funciones/${funcionId}/butacas-disponibles`);
}

// PrecioEntradaDTO: { tipo, nombre, seccion, condiciones, precio }
export async function getPrecios(funcionId) {
  return api.get(`/api/funciones/${funcionId}/precios`);
}
