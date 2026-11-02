import styles from './lectura.module.css';

export default function PaginaLectura({ titulo, bajada, actualizado, secciones, notaFinal, children }) {
  const indice = (
    <ol className={styles.indiceLista}>
      {secciones.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`}>{s.titulo}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={`section ${styles.pagina}`}>
      <title>{`${titulo} | CineClick`}</title>
      <header className={styles.cabecera} id="arriba">
        <h1 className={styles.titulo}>{titulo}</h1>
        {bajada && <p className={styles.bajada}>{bajada}</p>}
        {actualizado && <p className={styles.actualizado}>Última actualización: {actualizado}</p>}
      </header>

      <div className={styles.cuerpo}>
        <nav className={styles.indice} aria-label="Índice">
          <details className={styles.indiceMovil}>
            <summary>Índice</summary>
            {indice}
          </details>
          <div className={styles.indiceEscritorio}>
            <p className={styles.indiceTitulo}>En esta página</p>
            {indice}
          </div>
        </nav>

        <div className={styles.texto}>
          {children}
          {secciones.map((s) => (
            <section key={s.id} id={s.id} className={styles.seccion} aria-labelledby={`${s.id}-titulo`}>
              <h2 id={`${s.id}-titulo`} className={styles.seccionTitulo}>
                {s.titulo}
                <a href={`#${s.id}`} className={styles.ancla} aria-label={`Enlace a la sección ${s.titulo}`}>
                  #
                </a>
              </h2>
              {s.contenido}
            </section>
          ))}
          {notaFinal && <p className={styles.notaFinal}>{notaFinal}</p>}
          <a href="#arriba" className={`btn btn-sm ${styles.volverArriba}`}>
            ↑ Volver arriba
          </a>
        </div>
      </div>
    </div>
  );
}
