import { ApiError, api } from './http';
import { aSlug } from '../lib/slug';

// PeliculaResponseDTO: { id, titulo, sinopsis, duracionMinutos, clasificacion, genero, idioma,
//   formatosDisponibles: [], urlPoster, fechaEstreno: 'yyyy-mm-dd', activa, destacada }

export async function getPeliculas() {
  return api.get('/api/peliculas');
}

// La API no busca por slug: se busca en la lista de peliculas activas. Si el slug es un numero
// (los links viejos del estilo /peliculas/45) se busca por id.
export async function getPeliculaPorSlug(slug) {
  const pelicula = (await getPeliculas()).find((p) => aSlug(p.titulo) === slug);
  if (pelicula) return pelicula;
  if (/^\d+$/.test(slug)) return getPelicula(slug);
  throw new ApiError(404, `Pelicula no encontrada: ${slug}`);
}

export async function getPelicula(id) {
  return api.get(`/api/peliculas/${id}`);
}

// PeliculaDestacadaDTO: { pelicula: PeliculaResponseDTO, categoria: 'PREVENTA' | 'NOVEDAD' | 'PROXIMAMENTE' }
// PREVENTA: estreno futuro y funciones a la venta. PROXIMAMENTE: estreno futuro sin funciones.
// NOVEDAD: estrenada en los ultimos 7 dias. Hasta 8, ordenadas como van en el slider.
export async function getDestacadas() {
  return api.get('/api/peliculas/destacadas');
}

// Preventas y proximos estrenos (sin novedades), por fecha de estreno
export async function getProximosEstrenos() {
  return api.get('/api/peliculas/proximos-estrenos');
}
