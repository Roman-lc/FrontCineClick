import { useEffect, useState } from 'react';
import Poster from '../../components/ui/Poster';
import { EsqueletoFilas } from '../../components/ui/Esqueletos';
import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma } from '../../lib/formato';
import { getCombinables } from '../../services/funciones';
import styles from './combinables.module.css';

// Doble funcion: que mas se puede ver el mismo dia en el mismo cine, antes o despues de la funcion elegida.
// Los horarios de fin son estimados (duracion + publicidad), por eso llevan "aprox.".
//   onElegir(sugerencia): al tocar una tarjeta (la barra la selecciona; la confirmacion lleva a comprarla).
export default function PanelCombinables({ funcionId, onElegir, idTitulo }) {
  const [estado, setEstado] = useState({ cargando: true, error: false, datos: null, funcionId });

  useEffect(() => {
    let ignorar = false;
    getCombinables(funcionId)
      .then((datos) => !ignorar && setEstado({ cargando: false, error: false, datos, funcionId }))
      .catch(() => !ignorar && setEstado({ cargando: false, error: true, datos: null, funcionId }));
    return () => {
      ignorar = true;
    };
  }, [funcionId]);

  const cargando = estado.cargando || estado.funcionId !== funcionId;
  if (cargando) return <EsqueletoFilas cantidad={2} alto={72} etiqueta="Buscando otras funciones" />;
  if (estado.error) return <p className={styles.vacio}>No pudimos buscar otras funciones. Probá de nuevo en un rato.</p>;

  const { elegida, antes, despues } = estado.datos;
  return (
    <div className={styles.panel}>
      <p className={styles.referencia} id={idTitulo}>
        <strong>{elegida.pelicula}</strong> · {horaCorta(elegida.inicio)} a {horaCorta(elegida.finEstimado)} aprox.
      </p>
      {!antes.length && !despues.length ? (
        <p className={styles.vacio}>No hay otras funciones que combinen ese día en este cine.</p>
      ) : (
        <div className={styles.columnas}>
          <Columna titulo="Antes" sugerencias={antes} cuando="antes" onElegir={onElegir} />
          <Columna titulo="Después" sugerencias={despues} cuando="despues" onElegir={onElegir} />
        </div>
      )}
    </div>
  );
}

function Columna({ titulo, sugerencias, cuando, onElegir }) {
  return (
    <section className={styles.columna} aria-label={`Funciones ${titulo.toLowerCase()}`}>
      <h3 className={styles.columnaTitulo}>{titulo}</h3>
      {!sugerencias.length ? (
        <p className={styles.sinSugerencias}>{cuando === 'antes' ? 'Nada que termine a tiempo antes.' : 'Nada que empiece después.'}</p>
      ) : (
        <ul className={styles.lista}>
          {sugerencias.map((s) => (
            <li key={s.funcionId}>
              <button type="button" className={styles.tarjeta} onClick={() => onElegir(s)}>
                <Poster pelicula={{ titulo: s.pelicula, urlPoster: s.urlPoster }} className={styles.poster} />
                <span className={styles.datos}>
                  <span className={styles.titulo}>{s.pelicula}</span>
                  <span className={styles.detalle}>
                    {etiquetaFormato(s.formato)} · {etiquetaIdioma(s.idioma)} · {s.sala}
                  </span>
                  <span className={styles.horario}>
                    {horaCorta(s.inicio)} a {horaCorta(s.finEstimado)} aprox.
                  </span>
                  <span className={styles.entre}>
                    Te quedan {s.minutosEntre} min entre una y otra
                    {s.minutosEntre < 20 && <span className={styles.justo}> · Justo: salís y entrás</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
