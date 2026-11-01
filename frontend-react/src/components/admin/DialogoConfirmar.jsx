import { useEffect, useId, useRef } from 'react';
import styles from './admin.module.css';

// Dialogo modal de confirmacion (role="alertdialog"). Se usa a traves de useConfirmacion.
export default function DialogoConfirmar({ pedido, onResponder }) {
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (pedido && !dialogo.open) dialogo.showModal();
    if (!pedido && dialogo.open) dialogo.close();
  }, [pedido]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      className={styles.dialogo}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-mensaje`}
      onCancel={(e) => {
        e.preventDefault();
        onResponder(false);
      }}
    >
      {pedido && (
        <>
          <h2 id={`${id}-titulo`} className={styles.dialogoTitulo}>
            {pedido.titulo}
          </h2>
          <p id={`${id}-mensaje`} className={styles.dialogoMensaje}>
            {pedido.mensaje}
          </p>
          <div className={styles.dialogoAcciones}>
            {!pedido.soloAceptar && (
              // El foco arranca en Cancelar: Enter por reflejo no ejecuta la accion destructiva
              <button type="button" className="btn" onClick={() => onResponder(false)} autoFocus>
                {pedido.textoCancelar ?? 'Cancelar'}
              </button>
            )}
            <button
              type="button"
              className={`btn ${pedido.peligro === 'borrado' ? 'btn-danger-lleno' : pedido.peligro ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => onResponder(true)}
              autoFocus={pedido.soloAceptar}
            >
              {pedido.textoConfirmar ?? 'Aceptar'}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
