import IconoButaca from '../../components/ui/IconoButaca';
import { nivelDisponibilidad } from '../../lib/disponibilidad';
import { horaCorta } from '../../lib/fechas';
import styles from './pelicula.module.css';

// Horario con el icono de disponibilidad. Tocarlo elige la funcion (la pagina muestra la barra para comprar).
export default function ChipHorario({ funcion, elegida, onElegir }) {
  const hora = horaCorta(funcion.fechaHoraInicio);
  const nivel = nivelDisponibilidad(funcion);
  const contenido = (
    <>
      <span className={styles[nivel.clave]}>
        <IconoButaca />
      </span>
      {hora}hs
    </>
  );

  if (nivel.clave === 'completa') {
    return (
      <span className={`${styles.chip} ${styles.chipCompleta}`} aria-disabled="true" aria-label={`${hora}, completa`}>
        {contenido}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={elegida}
      onClick={() => onElegir(elegida ? null : funcion)}
      aria-label={`${hora}, disponibilidad ${nivel.etiqueta.toLowerCase()}`}
    >
      {contenido}
    </button>
  );
}
