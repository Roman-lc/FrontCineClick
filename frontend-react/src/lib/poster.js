export function posterGrande(url) {
  if (!url) return url;
  return url.replace(/(image\.tmdb\.org\/t\/p\/)w\d+\//, '$1w780/');
}
