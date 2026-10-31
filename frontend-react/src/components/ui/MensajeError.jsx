import styles from './estados.module.css';

// mensaje: normalmente el `mensaje` que devuelve el backend (ApiError.message).
export default function MensajeError({ mensaje, onReintentar }) {
  return (
    <div className={`${styles.estado} ${styles.error}`} role="alert">
      <p>
        <strong>Algo salió mal.</strong> {mensaje}
      </p>
      {onReintentar && (
        <button type="button" className="btn" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}
