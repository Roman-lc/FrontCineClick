import styles from './estados.module.css';

export default function EstadoVacio({ titulo, mensaje, children }) {
  return (
    <div className={styles.estado}>
      {titulo && <p className={styles.titulo}>{titulo}</p>}
      {mensaje && <p>{mensaje}</p>}
      {children && <div className={styles.acciones}>{children}</div>}
    </div>
  );
}
