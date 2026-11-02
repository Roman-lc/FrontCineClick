import { simular, simularNoEncontrado } from './simular';
import { funcionesMock } from './funciones';
import { peliculasMock } from './peliculas';

// Mismas reglas que el backend: fin estimado = inicio + duracion + 15 min de publicidad, margen de 10 min y
// ventana de 3 h, mismo cine y dia, otras peliculas y con butacas libres. Hasta 4 por lista.
const PUBLICIDAD = 15;
const MARGEN = 10;
const VENTANA = 180;
const minutos = (iso) => new Date(iso).getTime() / 60000;
const isoLocal = (ms) => {
  const d = new Date(ms);
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}:00`;
};

function fin(funcion) {
  const pelicula = peliculasMock.find((p) => p.id === funcion.peliculaId);
  return isoLocal((minutos(funcion.fechaHoraInicio) + (pelicula?.duracionMinutos ?? 120) + PUBLICIDAD) * 60000);
}

function combinable(funcion, minutosEntre) {
  const pelicula = peliculasMock.find((p) => p.id === funcion.peliculaId) ?? {};
  return {
    funcionId: funcion.id,
    peliculaId: funcion.peliculaId,
    pelicula: funcion.peliculaTitulo,
    urlPoster: pelicula.urlPoster ?? null,
    formato: funcion.formato,
    idioma: funcion.idioma,
    sala: funcion.salaNombre,
    inicio: funcion.fechaHoraInicio,
    finEstimado: fin(funcion),
    minutosEntre: Math.round(minutosEntre),
    butacasLibres: funcion.butacasLibres,
  };
}

export async function combinablesMock(id) {
  const elegida = funcionesMock.find((f) => String(f.id) === String(id));
  if (!elegida) return simularNoEncontrado(`Funcion no encontrada con id ${id}`);
  const finElegida = fin(elegida);
  const candidatas = funcionesMock.filter(
    (f) =>
      f.cineId === elegida.cineId &&
      f.peliculaId !== elegida.peliculaId &&
      f.fechaHoraInicio.slice(0, 10) === elegida.fechaHoraInicio.slice(0, 10) &&
      f.butacasLibres > 0 &&
      new Date(f.fechaHoraInicio) > new Date()
  );
  const antes = [];
  const despues = [];
  for (const f of candidatas) {
    const entreAntes = minutos(elegida.fechaHoraInicio) - minutos(fin(f));
    const entreDespues = minutos(f.fechaHoraInicio) - minutos(finElegida);
    if (entreAntes >= MARGEN && entreAntes <= VENTANA) antes.push(combinable(f, entreAntes));
    else if (entreDespues >= MARGEN && entreDespues <= VENTANA) despues.push(combinable(f, entreDespues));
  }
  const cercania = (a, b) => a.minutosEntre - b.minutosEntre;
  return simular({
    elegida: { funcionId: elegida.id, pelicula: elegida.peliculaTitulo, inicio: elegida.fechaHoraInicio, finEstimado: finElegida },
    antes: antes.sort(cercania).slice(0, 4),
    despues: despues.sort(cercania).slice(0, 4),
  });
}
