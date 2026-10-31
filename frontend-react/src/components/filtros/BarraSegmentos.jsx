import styles from './filtros.module.css';

export default function BarraSegmentos({ etiqueta, children }) {
  return (
    <div className={styles.barra} role="group" aria-label={etiqueta}>
      {children}
    </div>
  );
}
