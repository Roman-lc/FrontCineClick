import { useEffect, useId, useRef } from 'react';
import { IconoCerrar } from './Iconos';
import styles from './admin.module.css';

// Panel lateral desde la derecha, hecho con <dialog> modal: el foco queda adentro mientras esta
// abierto y vuelve al boton que lo abrio al cerrarse. Escape, la X y el clic en el fondo piden
// cerrar (onCerrar decide, por ejemplo, si hay que confirmar cambios sin guardar).
export default function Drawer({ abierto, titulo, onCerrar, pie, children }) {
  const ref = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      // El foco arranca en el primer campo del formulario (y no en la X)
      dialogo.querySelector('form input, form select, form textarea')?.focus();
    }
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      onClick={(e) => e.target === ref.current && onCerrar()}
    >
      {abierto && (
        <div className={styles.drawerPanel}>
          <div className={styles.drawerCabecera}>
            <h2 id={idTitulo} className={styles.drawerTitulo}>
              {titulo}
            </h2>
            <button type="button" className={styles.botonCerrar} aria-label="Cerrar" onClick={onCerrar}>
              <IconoCerrar />
            </button>
          </div>
          <div className={styles.drawerCuerpo}>{children}</div>
          {pie && <div className={styles.drawerPie}>{pie}</div>}
        </div>
      )}
    </dialog>
  );
}
