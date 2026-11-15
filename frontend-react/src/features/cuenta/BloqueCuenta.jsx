import styles from './miCuenta.module.css';

export default function BloqueCuenta({ id, titulo, editando, onEditar, textoEditar = 'Editar', sinEditar = false, children }) {
  return (
    <section id={id} className={styles.bloque} aria-labelledby={`${id}-titulo`}>
      <div className={styles.cabeceraBloque}>
        <h2 id={`${id}-titulo`} className={styles.tituloBloque}>
          {titulo}
        </h2>
        {!sinEditar && !editando && (
          <button type="button" className="btn btn-sm" onClick={onEditar}>
            {textoEditar}
            <span className="visually-hidden"> {titulo.toLowerCase()}</span>
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function DatosLectura({ filas }) {
  return (
    <dl className={styles.datos}>
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className={styles.dato}>
          <dt>{etiqueta}</dt>
          <dd>{valor || <span className={styles.sinDato}>Sin cargar</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AccionesEdicion({ guardando, onCancelar, textoGuardar = 'Guardar', textoGuardando = 'Guardando…' }) {
  return (
    <div className={styles.acciones}>
      <button type="submit" className="btn btn-primary" disabled={guardando} aria-busy={guardando}>
        {guardando && <span className="spinner-boton" aria-hidden="true" />}
        {guardando ? textoGuardando : textoGuardar}
      </button>
      <button type="button" className="btn" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </button>
    </div>
  );
}
