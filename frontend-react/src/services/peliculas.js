import { api } from './http';
import { USE_MOCKS, simular, simularNoEncontrado } from '../mocks/simular';
import { peliculasMock } from '../mocks/peliculas';

// PeliculaResponseDTO: { id, titulo, sinopsis, duracionMinutos, clasificacion, genero, idioma,
//   formatosDisponibles: [], urlPoster, fechaEstreno: 'yyyy-mm-dd', activa }

export async function getPeliculas() {
  if (USE_MOCKS) return simular(peliculasMock);
  return api.get('/api/peliculas');
}

export async function getPelicula(id) {
  if (USE_MOCKS) {
    const pelicula = peliculasMock.find((p) => String(p.id) === String(id));
    return pelicula ? simular(pelicula) : simularNoEncontrado(`Pelicula no encontrada con id ${id}`);
  }
  return api.get(`/api/peliculas/${id}`);
}
