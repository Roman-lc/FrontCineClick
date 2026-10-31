import { Link } from 'react-router-dom';
import PeliculaCard from '../../components/ui/PeliculaCard';
import { fechaDiaMes } from '../../lib/fechas';
import BotonAviso from '../listaEspera/BotonAviso';
import { useListaEspera } from '../listaEspera/useListaEspera';
import styles from './cartelera.module.css';

// Debajo de la cartelera: preventas (con entradas a la venta) y proximos estrenos (lista de espera).
// proximos: [{ pelicula, categoria }] de GET /api/peliculas/proximos-estrenos
export default function ProximosEstrenos({ proximos }) {
  const { anotadas, marcar } = useListaEspera();
  if (proximos.length === 0) return null;

  return (
    <section className={styles.proximos} aria-labelledby="titulo-proximos">
      <h2 id="titulo-proximos" className={styles.tituloSeccion}>
        Próximos estrenos
      </h2>
      <p className={styles.bajada}>Comprá tus entradas en preventa o pedí que te avisemos cuando salgan a la venta.</p>
      <ul className={styles.grilla}>
        {proximos.map(({ pelicula, categoria }) => {
          const detalle = `/peliculas/${pelicula.id}`;
          const preventa = categoria === 'PREVENTA';
          return (
            <li key={pelicula.id}>
              <PeliculaCard pelicula={pelicula} to={detalle}>
                <div className={styles.proximoPie}>
                  <p className={styles.proximoFecha}>
                    <span className={`${styles.etiqueta} ${preventa ? styles.etiquetaPreventa : styles.etiquetaProxima}`}>
                      {preventa ? 'Preventa' : 'Próximamente'}
                    </span>
                    <span>Estreno {fechaDiaMes(pelicula.fechaEstreno)}</span>
                  </p>
                  {preventa ? (
                    <Link to={detalle} className={`btn btn-primary btn-sm ${styles.proximoAccion}`}>
                      Comprar entradas
                    </Link>
                  ) : (
                    <BotonAviso
                      pelicula={pelicula}
                      anotada={anotadas.has(pelicula.id)}
                      onCambio={marcar}
                      className={styles.proximoAccion}
                    />
                  )}
                </div>
              </PeliculaCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
