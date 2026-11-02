import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getPeliculaPorSlug } from '../../services/peliculas';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoDetallePelicula } from '../../components/ui/Esqueletos';
import { rutaPelicula, aSlug } from '../../lib/slug';
import FichaPelicula from './FichaPelicula';
import HorariosPelicula from './HorariosPelicula';
import BarraFuncionElegida from '../compra/BarraFuncionElegida';
import styles from './pelicula.module.css';

// La URL es /peliculas/<slug del titulo>. El cine y el dia elegidos en la cartelera llegan en el
// estado de la navegacion (no en la URL). La key reinicia todo al pasar de una pelicula a otra.
export default function PeliculaPage() {
  const { slug } = useParams();
  return <DetallePelicula key={slug} slug={slug} />;
}

function DetallePelicula({ slug }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState(() => ({
    cineId: location.state?.cineId ?? '',
    dia: location.state?.dia ?? '',
    formatos: [],
    idioma: '',
  }));
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });
  const [elegida, setElegida] = useState(null);

  useEffect(() => {
    let ignorar = false;
    getPeliculaPorSlug(slug)
      .then(async (pelicula) => {
        // Un link viejo con el id (/peliculas/45) se reemplaza por el del titulo
        if (aSlug(pelicula.titulo) !== slug) {
          navigate(rutaPelicula(pelicula.titulo), { replace: true, state: location.state });
          return;
        }
        const [cines, funciones] = await Promise.all([getCines(), getFunciones({ peliculaId: pelicula.id })]);
        if (!ignorar) setEstado({ cargando: false, error: null, datos: { pelicula, cines, funciones } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [slug, intento, navigate, location.state]);

  const cambiarFiltros = (cambios) => setFiltros((actuales) => ({ ...actuales, ...cambios }));

  if (estado.cargando) {
    return (
      <section className="section">
        <EsqueletoDetallePelicula className={styles.detalle} />
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
            <EstadoVacio titulo="No encontramos esa película" mensaje="Puede que ya no esté en cartelera. Fijate qué hay para ver hoy.">
              <Link to="/" className="btn btn-primary">
                Volver a la cartelera
              </Link>
            </EstadoVacio>
          </>
        ) : (
          <EstadoError
            titulo="No pudimos cargar la película"
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
        elegidaId={elegida?.id}
        onElegir={setElegida}
      />
      {elegida && <BarraFuncionElegida funcion={elegida} onQuitar={() => setElegida(null)} onCambiar={setElegida} />}
    </section>
  );
}
