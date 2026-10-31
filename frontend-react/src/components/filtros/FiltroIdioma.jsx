import Desplegable from '../ui/Desplegable';
import { cerrarSiFueMouse } from './cerrarSiFueMouse';
import styles from './filtros.module.css';

// seleccionado = '' significa todos los idiomas
export default function FiltroIdioma({ idiomas, seleccionado, onCambiar }) {
  return (
    <Desplegable etiqueta={seleccionado || 'Idioma'} activo={Boolean(seleccionado)}>
      {(cerrar) => (
        <fieldset className={styles.opciones}>
          <legend className="visually-hidden">Idioma</legend>
          {['', ...idiomas].map((idioma) => (
            <label key={idioma || 'todos'} className={styles.opcion}>
              <input
                type="radio"
                name="idioma"
                checked={seleccionado === idioma}
                onChange={() => onCambiar(idioma)}
                onClick={cerrarSiFueMouse(cerrar)}
              />
              {idioma || 'Todos'}
            </label>
          ))}
        </fieldset>
      )}
    </Desplegable>
  );
}
