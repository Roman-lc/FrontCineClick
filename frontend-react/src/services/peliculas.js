import { api } from './http';
import { USE_MOCKS, simular, simularNoEncontrado } from '../mocks/simular';
import { peliculasMock } from '../mocks/peliculas';
import { destacadasMock, proximosEstrenosMock } from '../mocks/destacadas';

// PeliculaResponseDTO: { id, titulo, sinopsis, duracionMinutos, clasificacion, genero, idioma,
//   formatosDisponibles: [], urlPoster, fechaEstreno: 'yyyy-mm-dd', activa, destacada }

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

// PeliculaDestacadaDTO: { pelicula: PeliculaResponseDTO, categoria: 'PREVENTA' | 'NOVEDAD' | 'PROXIMAMENTE' }
// PREVENTA: estreno futuro y funciones a la venta. PROXIMAMENTE: estreno futuro sin funciones.
// NOVEDAD: estrenada en los ultimos 7 dias. Hasta 8, ordenadas como van en el slider.
export async function getDestacadas() {
  if (USE_MOCKS) return simular(destacadasMock().slice(0, 8));
  return api.get('/api/peliculas/destacadas');
}

// Preventas y proximos estrenos (sin novedades), por fecha de estreno
export async function getProximosEstrenos() {
  if (USE_MOCKS) return simular(proximosEstrenosMock());
  return api.get('/api/peliculas/proximos-estrenos');
}
