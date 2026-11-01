// URLs legibles a partir de un nombre o titulo:
// "¿Querés ser mi hijo?" -> "queres-ser-mi-hijo", "Verity: La sombra de un engaño" -> "verity-la-sombra-de-un-engano"
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

// "CineClick Abasto" -> "/cines/cineclick-abasto"
export function rutaCine(nombre) {
  return `/cines/${aSlug(nombre)}`;
}
