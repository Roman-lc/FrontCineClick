import { cinesMock } from './cines.js';
import { peliculasMock } from './peliculas.js';

// Misma forma que FuncionResponseDTO. Las fechas se calculan desde "ahora" para que los mocks
// no venzan: con fechas fijas la cartelera queda vacia al pasar los dias (como paso con la base).

function isoLocal(fecha) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}` +
    `T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`
  );
}

// Hoy, a N horas de ahora (redondeado a los 15 minutos). Negativo = ya empezo.
function hoyEnHoras(horas) {
  const fecha = new Date();
  fecha.setMinutes(Math.round(fecha.getMinutes() / 15) * 15 + horas * 60, 0, 0);
  return fecha;
}

function enDias(dias, hora) {
  const [h, m] = hora.split(':').map(Number);
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(h, m, 0, 0);
  return fecha;
}

const salas = new Map(
  cinesMock.flatMap((cine) => cine.salas.map((sala) => [sala.id, { ...sala, cineId: cine.id, cineNombre: cine.nombre }]))
);

// [peliculaId, salaId, inicio, formato, idioma, precioBase, extra]
const programacion = [
  [2, 1, hoyEnHoras(-1), 'DOS_D', 'Castellano', 4200], // ya empezo: no se muestra
  [2, 1, hoyEnHoras(1), 'DOS_D', 'Castellano', 4200],
  [1, 2, hoyEnHoras(2), 'IMAX', 'Subtitulada', 6500],
  [101, 3, hoyEnHoras(3), 'DOS_D', 'Castellano', 4200],
  [102, 1, hoyEnHoras(4), 'TRES_D', 'Subtitulada', 5200, { butacasLibres: 0 }], // agotada
  [1, 2, enDias(1, '18:00'), 'IMAX', 'Subtitulada', 6500, { butacasLibres: 10 }], // disponibilidad media
  [1, 2, enDias(1, '21:30'), 'IMAX', 'Subtitulada', 6500, { butacasLibres: 3 }], // disponibilidad baja
  [2, 1, enDias(1, '15:00'), 'DOS_D', 'Castellano', 4200, { butacasLibres: 15 }],
  [2, 1, enDias(1, '17:30'), 'DOS_D', 'Castellano', 4200, { butacasLibres: 0 }],
  [2, 3, enDias(1, '16:00'), 'TRES_D', 'Castellano', 5200],
  [101, 3, enDias(1, '20:00'), 'DOS_D', 'Castellano', 4200],
  [102, 1, enDias(1, '22:00'), 'TRES_D', 'Subtitulada', 5200],
  [103, 3, enDias(1, '19:00'), 'DOS_D', 'Castellano', 4200],
  [1, 2, enDias(2, '20:30'), 'IMAX', 'Subtitulada', 6500],
  [2, 1, enDias(2, '16:00'), 'TRES_D', 'Castellano', 5200],
  [103, 1, enDias(2, '18:30'), 'DOS_D', 'Castellano', 4200],
  [102, 3, enDias(2, '21:00'), 'DOS_D', 'Subtitulada', 4200, { estado: 'CANCELADA' }],
  [101, 1, enDias(3, '20:00'), 'DOS_D', 'Castellano', 4200],
  [103, 3, enDias(3, '17:00'), 'DOS_D', 'Castellano', 4200],
  [1, 2, enDias(4, '19:00'), 'IMAX', 'Subtitulada', 6500],
  [2, 3, enDias(5, '15:30'), 'DOS_D', 'Castellano', 4200],
  [102, 1, enDias(6, '21:30'), 'DOS_D', 'Subtitulada', 4200],
];

export const funcionesMock = programacion.map(([peliculaId, salaId, inicio, formato, idioma, precioBase, extra], i) => {
  const pelicula = peliculasMock.find((p) => p.id === peliculaId);
  const sala = salas.get(salaId);
  const fin = new Date(inicio.getTime() + pelicula.duracionMinutos * 60_000);
  return {
    id: 1001 + i,
    peliculaId,
    peliculaTitulo: pelicula.titulo,
    cineId: sala.cineId,
    cineNombre: sala.cineNombre,
    salaId,
    salaNombre: sala.nombre,
    fechaHoraInicio: isoLocal(inicio),
    fechaHoraFin: isoLocal(fin),
    precioBase,
    formato,
    idioma,
    estado: 'PROGRAMADA',
    butacasLibres: sala.capacidad - ((i * 7) % 12),
    capacidadSala: sala.capacidad,
    ...extra,
  };
});
