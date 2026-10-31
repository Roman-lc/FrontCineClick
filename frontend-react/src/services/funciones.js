import { api } from './http';
import { USE_MOCKS, simular, simularNoEncontrado } from '../mocks/simular';
import { funcionesMock } from '../mocks/funciones';

// FuncionResponseDTO: { id, peliculaId, peliculaTitulo, cineId, cineNombre, salaId, salaNombre,
//   fechaHoraInicio, fechaHoraFin (sin zona horaria: hora local del cine), precioBase, formato,
//   idioma, estado, butacasLibres }

// Filtros opcionales, igual que el backend: peliculaId, cineId y fecha ('yyyy-mm-dd').
export async function getFunciones({ peliculaId, cineId, fecha } = {}) {
  if (USE_MOCKS) {
    return simular(
      funcionesMock.filter(
        (f) =>
          (!peliculaId || String(f.peliculaId) === String(peliculaId)) &&
          (!cineId || String(f.cineId) === String(cineId)) &&
          (!fecha || f.fechaHoraInicio.startsWith(fecha))
      )
    );
  }
  const query = new URLSearchParams();
  if (peliculaId) query.set('peliculaId', peliculaId);
  if (cineId) query.set('cineId', cineId);
  if (fecha) query.set('fecha', fecha);
  const qs = query.toString();
  return api.get(`/api/funciones${qs ? `?${qs}` : ''}`);
}

export async function getFuncion(id) {
  if (USE_MOCKS) {
    const funcion = funcionesMock.find((f) => String(f.id) === String(id));
    return funcion ? simular(funcion) : simularNoEncontrado(`Funcion no encontrada con id ${id}`);
  }
  return api.get(`/api/funciones/${id}`);
}
