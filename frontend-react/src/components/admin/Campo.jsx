import styles from './admin.module.css';

// Label + control + texto de ayuda o error. El control se arma con la funcion children, que recibe
// las props de accesibilidad (id, aria-describedby, aria-invalid) para que no se olviden.
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
