import { useId, useState } from 'react';
import styles from './Ayuda.module.css';

// Boton "?" con una burbuja de ayuda. Se abre con el mouse encima, con el foco o tocandolo (mobile).
export default function Ayuda({ etiqueta, children }) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();

  return (
    <span className={styles.ayuda} onMouseEnter={() => setAbierta(true)} onMouseLeave={() => setAbierta(false)}>
      <button
        type="button"
        className={styles.boton}
        aria-label={etiqueta}
        aria-expanded={abierta}
        aria-describedby={abierta ? id : undefined}
        onClick={() => setAbierta((a) => !a)}
        onFocus={() => setAbierta(true)}
        onBlur={() => setAbierta(false)}
        onKeyDown={(e) => e.key === 'Escape' && setAbierta(false)}
      >
        ?
      </button>
      {abierta && (
        <span id={id} role="tooltip" className={styles.burbuja}>
          {children}
        </span>
      )}
    </span>
  );
}
