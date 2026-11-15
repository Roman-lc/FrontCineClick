import { nivelDisponibilidad } from '../../lib/disponibilidad';
import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, etiquetaIdiomaCorta, nombreCine } from '../../lib/formato';
import IconoButaca from './IconoButaca';
import styles from './ChipHorario.module.css';

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
