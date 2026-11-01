import styles from './estados.module.css';

/**
 * Error al cargar datos. Nunca muestra el mensaje tecnico del backend: dice que fallo y ofrece reintentar.
 *
 * Props:
 * - titulo: que no se pudo cargar ("No pudimos cargar la cartelera")
 * - mensaje: sugerencia opcional; por defecto pide revisar la conexion
 * - onReintentar: repite la peticion. Sin esta prop no se muestra el boton
 */
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
