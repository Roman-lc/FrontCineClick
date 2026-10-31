import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getPeliculas } from '../../services/peliculas';
import PeliculaCard from '../../components/ui/PeliculaCard';
import Cargando from '../../components/ui/Cargando';
import MensajeError from '../../components/ui/MensajeError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import IconoEstrella from '../../components/ui/IconoEstrella';
import SelectorCine from '../../components/ui/SelectorCine';
import { escribirFiltros, leerFiltros, queryCineYDia } from '../../lib/filtrosUrl';
import BarraFiltros from './BarraFiltros';
import HorariosDelDia from './HorariosDelDia';
import {
  armarCartelera,
  diaElegido,
  diasDeLaTira,
  esEstreno,
  funcionesVigentesDelCine,
  opcionesDeFiltro,
} from './filtros';
import styles from './cartelera.module.css';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: '', datos: null });

  // Se cargan una sola vez; los filtros se aplican en memoria
  useEffect(() => {
    let ignorar = false;
    Promise.all([getPeliculas(), getCines(), getFunciones()])
      .then(([peliculas, cines, funciones]) => {
        if (!ignorar) setEstado({ cargando: false, error: '', datos: { peliculas, cines, funciones } });
      })
      .catch((err) => {
        if (!ignorar) setEstado({ cargando: false, error: err.message, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  const reintentar = () => {
    setEstado({ cargando: true, error: '', datos: null });
    setIntento((n) => n + 1);
  };

  const filtros = leerFiltros(searchParams);
  const cambiarFiltros = (cambios) => setSearchParams((actuales) => escribirFiltros(actuales, cambios), { replace: true });

  const { datos } = estado;
  const cines = useMemo(() => (datos?.cines ?? []).filter((c) => c.activo !== false), [datos]);
  const funcionesDelCine = useMemo(
    () => funcionesVigentesDelCine(datos?.funciones ?? [], filtros.cineId),
    [datos, filtros.cineId]
  );
  const dias = diasDeLaTira(funcionesDelCine);
  const dia = diaElegido(dias, filtros.dia);
  const opciones = opcionesDeFiltro(funcionesDelCine, datos?.peliculas ?? []);
  const cartelera = armarCartelera(datos?.peliculas ?? [], funcionesDelCine, filtros, dia);

  const hayFiltrosExtra =
    filtros.formatos.length > 0 || filtros.idioma || filtros.generos.length > 0 || filtros.soloDestacadas || filtros.soloEstrenos;
  const quitarFiltros = () =>
    cambiarFiltros({ formatos: [], idioma: '', generos: [], soloDestacadas: false, soloEstrenos: false });

  return (
    <section className="section">
      <title>Cartelera | CineClick</title>

      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Películas en cartelera</h1>
        <button
          type="button"
          className={`${styles.pastilla} ${filtros.soloDestacadas ? styles.pastillaActiva : ''}`}
          aria-pressed={filtros.soloDestacadas}
          onClick={() => cambiarFiltros({ soloDestacadas: !filtros.soloDestacadas })}
        >
          <IconoEstrella />
          Destacadas
        </button>
      </div>

      <p className={styles.contexto}>
        <label htmlFor="cine-elegido">Está viendo películas de</label>{' '}
        <SelectorCine
          id="cine-elegido"
          cines={cines}
          valor={filtros.cineId}
          onCambiar={(cineId) => cambiarFiltros({ cineId })}
          opcionTodos="todos los cines"
        />
      </p>
      <ul className={styles.enlaces}>
        <li>
          <button type="button" className={styles.enlaceTexto} onClick={() => cambiarFiltros({ cineId: '' })}>
            Ver las películas de todos los cines
          </button>
        </li>
        <li>
          <Link to="/cines" className={styles.enlaceTexto}>
            Ver la cartelera por cine
          </Link>
        </li>
      </ul>

      {datos && <BarraFiltros filtros={filtros} opciones={opciones} dias={dias} dia={dia} onCambiar={cambiarFiltros} />}

      <p className={styles.resultado} aria-live="polite">
        {datos && cartelera.length > 0 && `${cartelera.length} ${cartelera.length === 1 ? 'película' : 'películas'}`}
      </p>

      {estado.cargando && <Cargando texto="Cargando cartelera..." />}
      {estado.error && <MensajeError mensaje={estado.error} onReintentar={reintentar} />}

      {datos && cartelera.length === 0 && (
        <EstadoVacio
          mensaje={
            hayFiltrosExtra || filtros.cineId
              ? 'No hay películas para los filtros elegidos.'
              : 'No hay funciones programadas por el momento.'
          }
        >
          {hayFiltrosExtra && (
            <button type="button" className="btn" onClick={quitarFiltros}>
              Quitar filtros
            </button>
          )}
          {filtros.cineId && (
            <button type="button" className="btn" onClick={() => cambiarFiltros({ cineId: '' })}>
              Ver todos los cines
            </button>
          )}
        </EstadoVacio>
      )}

      {cartelera.length > 0 && (
        <ul className={styles.grilla}>
          {cartelera.map(({ pelicula, funciones }) => (
            <li key={pelicula.id}>
              <PeliculaCard
                pelicula={pelicula}
                to={`/peliculas/${pelicula.id}${queryCineYDia(filtros.cineId, dia)}`}
                estreno={esEstreno(pelicula)}
              >
                <HorariosDelDia funciones={funciones} agruparPorCine={!filtros.cineId} />
              </PeliculaCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
