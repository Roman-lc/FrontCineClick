import styles from './estados.module.css';

export default function EstadoError({
  titulo = 'No pudimos cargar la información',
  mensaje = 'Revisá tu conexión y probá de nuevo.',
  onReintentar,
}) {
  return (
    <div className={`${styles.estado} ${styles.error}`} role="alert">
      <p className={styles.titulo} data-icono="error">
        {titulo}
      </p>
      <p>{mensaje}</p>
      {onReintentar && (
        <div className={styles.acciones}>
          <button type="button" className="btn btn-primary" onClick={onReintentar}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
