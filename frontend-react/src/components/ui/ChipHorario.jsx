import { nivelDisponibilidad } from '../../lib/disponibilidad';
import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, etiquetaIdiomaCorta, nombreCine } from '../../lib/formato';
import IconoButaca from './IconoButaca';
import styles from './ChipHorario.module.css';

/**
 * Horario de una funcion. Tocarlo la elige; la pagina muestra la barra para comprar.
 *
 * Props:
 * - funcion: FuncionResponseDTO (usa fechaHoraInicio, formato, idioma, butacasLibres, capacidadSala)
 * - elegida: si es la funcion elegida (se pinta con el acento)
 * - onElegir(funcion | null): al tocarla; recibe null si ya estaba elegida (la deselecciona)
 * - conDetalle: muestra "2D · Cast." debajo de la hora (en la cartelera, donde no hay grupos por formato)
 *
 * Estados: normal, elegida y agotada (sin butacas libres: queda deshabilitada y dice "Agotada").
 * El icono de butaca indica la disponibilidad (alta, media, baja), igual que la leyenda del detalle.
 * El ancho sale de la variable CSS --ancho-chip si el contenedor la define.
 */
export default function ChipHorario({ funcion, elegida = false, onElegir, conDetalle = false }) {
  const hora = horaCorta(funcion.fechaHoraInicio);
  const nivel = nivelDisponibilidad(funcion);
  const detalle = `${etiquetaFormato(funcion.formato)} · ${etiquetaIdiomaCorta(funcion.idioma)}`;

  if (nivel.clave === 'completa') {
    return (
      <span className={`${styles.chip} ${styles.agotada}`} aria-disabled="true" aria-label={`${hora}, agotada`}>
        <span className={styles.hora}>{hora}</span>
        <span className={styles.detalle}>Agotada</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={elegida}
      onClick={() => onElegir(elegida ? null : funcion)}
      aria-label={`${hora}, ${etiquetaFormato(funcion.formato)}, ${etiquetaIdioma(funcion.idioma)}${funcion.cineNombre ? `, ${nombreCine(funcion.cineNombre)}` : ''}, disponibilidad ${nivel.etiqueta.toLowerCase()}`}
    >
      <span className={styles.linea}>
        <span className={styles[nivel.clave]}>
          <IconoButaca tamano={14} />
        </span>
        <span className={styles.hora}>{hora}</span>
      </span>
      {conDetalle && <span className={styles.detalle}>{detalle}</span>}
    </button>
  );
}
