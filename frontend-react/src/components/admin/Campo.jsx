import styles from './admin.module.css';

export default function Campo({ id, etiqueta, opcional = false, ayuda, error, className = '', children }) {
  const idAyuda = `${id}-ayuda`;
  const texto = error || ayuda;
  return (
    <div className={`${styles.campo} ${className}`}>
      <label htmlFor={id} className={styles.etiqueta}>
        {etiqueta}
        {opcional && <span className={styles.opcional}> (opcional)</span>}
      </label>
      {children({
        id,
        className: styles.control,
        'aria-describedby': texto ? idAyuda : undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {texto && (
        <p id={idAyuda} className={error ? styles.error : styles.ayuda} data-icono={error ? 'error' : undefined}>
          {texto}
        </p>
      )}
    </div>
  );
}
