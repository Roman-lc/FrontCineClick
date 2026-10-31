import { funcionVigente, hoyISO, sumarDiasISO } from '../lib/fechas';
import { funcionesMock } from './funciones';
import { peliculasMock } from './peliculas';

// Misma regla que PeliculaService.categoria del backend
const DIAS_NOVEDAD = 7;
const ORDEN = ['PREVENTA', 'NOVEDAD', 'PROXIMAMENTE'];

function categoria(pelicula, hoy, aLaVenta) {
  if (!pelicula.fechaEstreno) return null;
  if (pelicula.fechaEstreno > hoy) return aLaVenta.has(pelicula.id) ? 'PREVENTA' : 'PROXIMAMENTE';
  return pelicula.fechaEstreno > sumarDiasISO(hoy, -DIAS_NOVEDAD) ? 'NOVEDAD' : null;
}

function conCategoria() {
  const hoy = hoyISO();
  const aLaVenta = new Set(funcionesMock.filter(funcionVigente).map((f) => f.peliculaId));
  return peliculasMock
    .filter((p) => p.activa !== false)
    .map((pelicula) => ({ pelicula, categoria: categoria(pelicula, hoy, aLaVenta) }))
    .filter((d) => d.categoria);
}

// Preventas, despues novedades (la mas reciente primero), despues proximos estrenos
export function destacadasMock() {
  return conCategoria().sort((a, b) => {
    const porCategoria = ORDEN.indexOf(a.categoria) - ORDEN.indexOf(b.categoria);
    if (porCategoria) return porCategoria;
    const porFecha = a.pelicula.fechaEstreno.localeCompare(b.pelicula.fechaEstreno);
    return a.categoria === 'NOVEDAD' ? -porFecha : porFecha;
  });
}

export function proximosEstrenosMock() {
  return conCategoria()
    .filter((d) => d.categoria !== 'NOVEDAD')
    .sort((a, b) => a.pelicula.fechaEstreno.localeCompare(b.pelicula.fechaEstreno) || a.pelicula.titulo.localeCompare(b.pelicula.titulo));
}
