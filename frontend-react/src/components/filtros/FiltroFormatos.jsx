import Desplegable from '../ui/Desplegable';
import { etiquetaFormato } from '../../lib/formato';
import styles from './filtros.module.css';

const alternar = (lista, valor) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

export default function FiltroFormatos({ formatos, seleccionados, onCambiar }) {
  return (
    <Desplegable
      etiqueta={seleccionados.length ? `Formatos (${seleccionados.length})` : 'Formatos'}
      activo={seleccionados.length > 0}
    >
      <fieldset className={styles.opciones}>
        <legend className="visually-hidden">Formatos</legend>
        {formatos.map((formato) => (
          <label key={formato} className={styles.opcion}>
            <input
              type="checkbox"
              checked={seleccionados.includes(formato)}
              onChange={() => onCambiar(alternar(seleccionados, formato))}
            />
            {etiquetaFormato(formato)}
          </label>
        ))}
      </fieldset>
    </Desplegable>
  );
}
