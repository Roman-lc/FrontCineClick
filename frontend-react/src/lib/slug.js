export function aSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function rutaPelicula(titulo) {
  return `/peliculas/${aSlug(titulo)}`;
}

export function rutaCine(nombre) {
  return `/cines/${aSlug(nombre)}`;
}
