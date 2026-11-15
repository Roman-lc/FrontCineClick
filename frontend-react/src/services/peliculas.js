import { ApiError, api } from './http';
import { aSlug } from '../lib/slug';

export async function getPeliculas() {
  return api.get('/api/peliculas');
}

export async function getPeliculaPorSlug(slug) {
  const pelicula = (await getPeliculas()).find((p) => aSlug(p.titulo) === slug);
  if (pelicula) return pelicula;
  if (/^\d+$/.test(slug)) return getPelicula(slug);
  throw new ApiError(404, `Pelicula no encontrada: ${slug}`);
}

export async function getPelicula(id) {
  return api.get(`/api/peliculas/${id}`);
}

export async function getDestacadas() {
  return api.get('/api/peliculas/destacadas');
}

export async function getProximosEstrenos() {
  return api.get('/api/peliculas/proximos-estrenos');
}
