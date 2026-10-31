import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

// Usa <dialog> nativo: showModal() ya atrapa el foco, cierra con Escape y lo devuelve al boton que lo abrio.
export default function Modal({ abierto, titulo, onCerrar, children }) {
  const ref = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
    >
      <div className={styles.caja}>
        <header className={styles.cabecera}>
          <h2 id={idTitulo} className={styles.titulo}>
            {titulo}
          </h2>
          <button type="button" className={styles.cerrar} aria-label="Cerrar" onClick={onCerrar}>
            ×
          </button>
        </header>
        <div className={styles.cuerpo}>{children}</div>
        <footer className={styles.pie}>
          <button type="button" className="btn btn-primary" onClick={onCerrar}>
            Entendido
          </button>
        </footer>
      </div>
    </dialog>
  );
}
