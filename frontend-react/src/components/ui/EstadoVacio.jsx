import styles from './estados.module.css';

// children: acciones opcionales (por ejemplo, un boton para quitar filtros).
export default function EstadoVacio({ mensaje, children }) {
  return (
    <div className={styles.estado}>
      <p>{mensaje}</p>
      {children}
    </div>
  );
}
