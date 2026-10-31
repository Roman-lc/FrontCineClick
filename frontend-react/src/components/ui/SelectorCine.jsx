import styles from './SelectorCine.module.css';

// Selector de cine resaltado con el acento, para usar dentro de una frase
// ("Está viendo películas de [cine]"). opcionTodos: texto de la opcion vacia, si se permite.
export default function SelectorCine({ id, cines, valor, onCambiar, opcionTodos }) {
  return (
    <select id={id} className={styles.selector} value={valor} onChange={(e) => onCambiar(e.target.value)}>
      {opcionTodos && <option value="">{opcionTodos}</option>}
      {cines.map((cine) => (
        <option key={cine.id} value={String(cine.id)}>
          {cine.nombre}
        </option>
      ))}
    </select>
  );
}
