import styles from './admin.module.css';

export default function BotonIcono({ etiqueta, onClick, peligro = false, children }) {
  return (
    <button
      type="button"
      className={`${styles.botonIcono} ${peligro ? styles.botonIconoPeligro : ''}`}
      aria-label={etiqueta}
      data-tooltip={etiqueta}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
