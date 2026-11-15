import { hoyISO, sumarDiasISO, fechaDeFuncion, funcionVigente } from '../../lib/fechas';

export const DIAS_EN_TIRA = 7;

const DIAS_DE_ESTRENO = 30;

export function esEstreno(pelicula, hoy = hoyISO()) {
  return Boolean(pelicula.fechaEstreno) && pelicula.fechaEstreno >= sumarDiasISO(hoy, -DIAS_DE_ESTRENO);
}

export function funcionesVigentesDelCine(funciones, cineId) {
  return funciones.filter((f) => funcionVigente(f) && (!cineId || String(f.cineId) === cineId));
}

export function diasDeLaTira(funcionesDelCine, hoy = hoyISO()) {
  const conFunciones = new Set(funcionesDelCine.map(fechaDeFuncion));
  return Array.from({ length: DIAS_EN_TIRA }, (_, i) => {
    const fecha = sumarDiasISO(hoy, i);
    return { fecha, tieneFunciones: conFunciones.has(fecha) };
  });
}

export function diaElegido(dias, diaPedido) {
  if (dias.some((d) => d.fecha === diaPedido && d.tieneFunciones)) return diaPedido;
  return (dias.find((d) => d.tieneFunciones) ?? dias[0]).fecha;
}

export function opcionesDeFiltro(funcionesDelCine, peliculas) {
  const idsEnCartelera = new Set(funcionesDelCine.map((f) => f.peliculaId));
  return {
    formatos: [...new Set(funcionesDelCine.map((f) => f.formato))],
    idiomas: [...new Set(funcionesDelCine.map((f) => f.idioma))].sort(),
    generos: [...new Set(peliculas.filter((p) => idsEnCartelera.has(p.id)).map((p) => p.genero))].sort(),
  };
}

export function armarCartelera(peliculas, funcionesDelCine, filtros, dia) {
  const porPelicula = new Map();
  for (const f of funcionesDelCine) {
    if (fechaDeFuncion(f) !== dia) continue;
    if (filtros.formatos.length && !filtros.formatos.includes(f.formato)) continue;
    if (filtros.idioma && f.idioma !== filtros.idioma) continue;
    if (!porPelicula.has(f.peliculaId)) porPelicula.set(f.peliculaId, []);
    porPelicula.get(f.peliculaId).push(f);
  }
  return peliculas
    .filter((p) => p.activa !== false && porPelicula.has(p.id))
    .filter((p) => !filtros.soloDestacadas || p.destacada)
    .filter((p) => !filtros.soloEstrenos || esEstreno(p))
    .filter((p) => !filtros.generos.length || filtros.generos.includes(p.genero))
    .sort((a, b) => Number(b.destacada) - Number(a.destacada) || (b.fechaEstreno || '').localeCompare(a.fechaEstreno || ''))
    .map((pelicula) => ({
      pelicula,
      funciones: porPelicula.get(pelicula.id).sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)),
    }));
}
