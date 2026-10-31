// Filtros de cartelera y detalle guardados en la URL (sobreviven a recargar y a volver atras).
const CLAVES = {
  cineId: 'cine',
  dia: 'dia',
  formatos: 'formato',
  idioma: 'idioma',
  generos: 'genero',
  soloDestacadas: 'destacadas',
  soloEstrenos: 'estrenos',
};

export function leerFiltros(searchParams) {
  const lista = (clave) => (searchParams.get(clave) || '').split(',').filter(Boolean);
  return {
    cineId: searchParams.get(CLAVES.cineId) || '',
    dia: searchParams.get(CLAVES.dia) || '',
    formatos: lista(CLAVES.formatos),
    idioma: searchParams.get(CLAVES.idioma) || '',
    generos: lista(CLAVES.generos),
    soloDestacadas: searchParams.get(CLAVES.soloDestacadas) === '1',
    soloEstrenos: searchParams.get(CLAVES.soloEstrenos) === '1',
  };
}

// Aplica un cambio parcial sin dejar parametros vacios
export function escribirFiltros(searchParams, cambios) {
  const nuevos = new URLSearchParams(searchParams);
  for (const [campo, valor] of Object.entries(cambios)) {
    const texto = Array.isArray(valor) ? valor.join(',') : valor === true ? '1' : valor || '';
    if (texto) nuevos.set(CLAVES[campo], texto);
    else nuevos.delete(CLAVES[campo]);
  }
  return nuevos;
}

// Query string para llevar el cine y el dia de una pantalla a otra: "?cine=1&dia=2026-10-31"
export function queryCineYDia(cineId, dia) {
  const qs = escribirFiltros(new URLSearchParams(), { cineId, dia }).toString();
  return qs ? `?${qs}` : '';
}
