import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getPelicula } from '../../services/peliculas';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import { escribirFiltros, leerFiltros } from '../../lib/filtrosUrl';
import FichaPelicula from './FichaPelicula';
import HorariosPelicula from './HorariosPelicula';
import styles from './pelicula.module.css';

// La key reinicia el estado al pasar de una pelicula a otra
export default function PeliculaPage() {
  const { id } = useParams();
  return <DetallePelicula key={id} id={id} />;
}

function DetallePelicula({ id }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });

  useEffect(() => {
    let ignorar = false;
    Promise.all([getPelicula(id), getCines(), getFunciones({ peliculaId: id })])
      .then(([pelicula, cines, funciones]) => {
        if (!ignorar) setEstado({ cargando: false, error: null, datos: { pelicula, cines, funciones } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [id, intento]);

  const filtros = leerFiltros(searchParams);
  const cambiarFiltros = (cambios) => setSearchParams((actuales) => escribirFiltros(actuales, cambios), { replace: true });

  if (estado.cargando) {
    return (
      <section className="section">
        <Cargando texto="Cargando película..." />
      </section>
    );
  }

  if (estado.error) {
    return (
      <section className="section">
        {estado.error.status === 404 ? (
          <>
            <title>Película no encontrada | CineClick</title>
            <h1>Película no encontrada</h1>
            <EstadoVacio mensaje="La película que buscás no existe o ya no está en cartelera.">
              <Link to="/" className="btn btn-primary">
                Volver a la cartelera
              </Link>
            </EstadoVacio>
          </>
        ) : (
          <MensajeError
            mensaje={estado.error.message}
            onReintentar={() => {
              setEstado({ cargando: true, error: null, datos: null });
              setIntento((n) => n + 1);
            }}
          />
        )}
      </section>
    );
  }

  const { pelicula, cines, funciones } = estado.datos;
  return (
    <section className={`section ${styles.detalle}`}>
      <title>{`${pelicula.titulo} | CineClick`}</title>
      <FichaPelicula pelicula={pelicula} />
      <HorariosPelicula
        pelicula={pelicula}
        cines={cines.filter((c) => c.activo !== false)}
        funciones={funciones}
        filtros={filtros}
        onCambiar={cambiarFiltros}
      />
    </section>
  );
}
