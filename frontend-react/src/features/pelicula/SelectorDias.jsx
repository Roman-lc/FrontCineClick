import { diaYFechaCortos } from '../../lib/fechas';
import styles from './pelicula.module.css';

// Tira de dias ('yyyy-mm-dd'). La cantidad de columnas sale de la cantidad de dias.
export default function SelectorDias({ dias, valor, onCambiar }) {
  return (
    <div className={styles.dias} style={{ '--cantidad-dias': dias.length }} role="group" aria-label="Día">
      {dias.map((fecha) => {
        const { dia: nombre, fecha: corta } = diaYFechaCortos(fecha);
        return (
          <button key={fecha} type="button" className={styles.dia} aria-pressed={fecha === valor} onClick={() => onCambiar(fecha)}>
            <span className={styles.diaNombre}>{nombre}</span>
            <span className={styles.diaFecha}>{corta}</span>
          </button>
        );
      })}
    </div>
  );
}
