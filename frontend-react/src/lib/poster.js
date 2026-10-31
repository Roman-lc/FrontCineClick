// El slider muestra el poster mas grande que la tarjeta. TMDB permite pedir otro tamaño cambiando
// el segmento de la URL (w500 -> w780, nitido en pantallas de alta densidad). Los de Wikipedia ya
// vienen en su tamaño original, que es el maximo disponible.
export function posterGrande(url) {
  if (!url) return url;
  return url.replace(/(image\.tmdb\.org\/t\/p\/)w\d+\//, '$1w780/');
}
