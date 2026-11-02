import { useEffect, useRef } from 'react';
import EstadoError from '../ui/EstadoError';
import EstadoVacio from '../ui/EstadoVacio';
import { EsqueletoFilas } from '../ui/Esqueletos';
import { IconoBuscar, IconoMas } from './Iconos';
import { FILTRO_ESTADO } from './filtros';
import styles from './admin.module.css';

// Dato vacio en la tabla: un guion en color secundario, que el lector de pantalla lee como "sin dato"
export function SinDato() {
  return (
    <span className={styles.sinDato}>
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">Sin dato</span>
    </span>
  );
}

// Estructura comun de las pantallas de gestion: titulo y boton principal, buscador, filtro de estado
// (y filtros extra), y la tabla o el estado que corresponda (cargando, error, vacio).
//   total: cantidad sin filtrar. cantidad: filas que quedan con los filtros.
export default function PaginaGestion({
  titulo,
  textoAgregar,
  onAgregar,
  busqueda,
  onBuscar,
  etiquetaBusqueda,
  estado,
  onEstado,
  opcionesEstado = FILTRO_ESTADO,
  filtrosExtra,
  carga,
  total,
  cantidad,
  textoCantidad,
  vacio,
  children,
}) {
  // En el celular la tabla se ve como tarjetas (ver .tablaCaja[data-tarjetas] en admin.module.css): cada celda
  // lleva el titulo de su columna en data-label. Se recalcula en cada render porque las filas cambian con los filtros.
  const caja = useRef(null);
  useEffect(() => {
    const tabla = caja.current?.querySelector('table');
    if (!tabla) return;
    const titulos = [...tabla.querySelectorAll('thead th')].map((th) => (th.classList.contains(styles.colAcciones) ? '' : th.textContent.trim()));
    for (const fila of tabla.querySelectorAll('tbody tr')) {
      [...fila.children].forEach((celda, i) => celda.setAttribute('data-label', titulos[i] ?? ''));
    }
  });

  return (
    <section>
      <title>{`${titulo} | Panel | CineClick`}</title>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>{titulo}</h1>
        {onAgregar && (
          <button type="button" className={`btn btn-primary ${styles.botonAgregar}`} onClick={onAgregar}>
            <IconoMas />
            {textoAgregar}
          </button>
        )}
      </div>

      <div className={styles.filtros}>
        <div className={styles.buscador}>
          <IconoBuscar />
          <input
            type="search"
            className={styles.control}
            placeholder={etiquetaBusqueda}
            aria-label={etiquetaBusqueda}
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
          />
        </div>
        {filtrosExtra}
        {onEstado && (
          <div className={styles.segmentos} role="group" aria-label="Filtrar por estado">
            {opcionesEstado.map((o) => (
              <button key={o.valor} type="button" className={styles.segmento} aria-pressed={estado === o.valor} onClick={() => onEstado(o.valor)}>
                {o.texto}
              </button>
            ))}
          </div>
        )}
      </div>

      {carga.cargando && <EsqueletoFilas cantidad={5} alto={52} etiqueta={`Cargando ${titulo.toLowerCase()}`} />}
      {carga.error && <EstadoError titulo={`No pudimos cargar ${titulo.toLowerCase()}`} onReintentar={carga.onReintentar} />}
      {!carga.cargando && !carga.error && (
        <>
          <p className={styles.resultado} aria-live="polite">
            {total > 0 && cantidad > 0 && (cantidad === total ? textoCantidad(total) : `${textoCantidad(cantidad)} de ${total}`)}
          </p>
          {cantidad === 0 ? (
            total === 0 ? (
              <EstadoVacio titulo={vacio.titulo} mensaje={vacio.mensaje}>
                {onAgregar && (
                  <button type="button" className="btn btn-primary" onClick={onAgregar}>
                    {textoAgregar}
                  </button>
                )}
              </EstadoVacio>
            ) : (
              <EstadoVacio titulo="No hay resultados con estos filtros" mensaje="Probá con otra búsqueda o con otro estado." />
            )
          ) : (
            <div ref={caja} className={styles.tablaCaja} data-tarjetas>
              {children}
            </div>
          )}
        </>
      )}
    </section>
  );
}
