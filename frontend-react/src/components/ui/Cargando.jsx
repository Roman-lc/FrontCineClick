import styles from './estados.module.css';

export default function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className={styles.estado} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}
