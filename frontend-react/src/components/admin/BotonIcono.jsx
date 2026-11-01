import styles from './admin.module.css';

// Boton cuadrado de 40px con solo un icono: el texto va en aria-label y en el tooltip,
// que aparece con el hover y con el foco del teclado.
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
