import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getDestacadas, getPeliculas, getProximosEstrenos } from '../../services/peliculas';
import PeliculaCard from '../../components/ui/PeliculaCard';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoGrillaPeliculas, EsqueletoSlider } from '../../components/ui/Esqueletos';
import IconoEstrella from '../../components/ui/IconoEstrella';
import Selector from '../../components/ui/Selector';
import { diaRelativo, hoyISO } from '../../lib/fechas';
import { escribirFiltros, leerFiltros } from '../../lib/filtrosUrl';
import { nombreCine } from '../../lib/formato';
import { rutaPelicula } from '../../lib/slug';
import BarraFiltros from './BarraFiltros';
import HorariosDelDia from './HorariosDelDia';
import ProximosEstrenos from './ProximosEstrenos';
import SliderDestacados from './SliderDestacados';
import BarraFuncionElegida from '../compra/BarraFuncionElegida';
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
  const [estado, setEstado] = useState({ cargando: true, error: false, datos: null });
  const [elegida, setElegida] = useState(null);
  const [estrenos, setEstrenos] = useState({ cargando: true, destacadas: [], proximos: [] });

  // Se cargan una sola vez; los filtros se aplican en memoria
  useEffect(() => {
    let ignorar = false;
    Promise.all([getPeliculas(), getCines(), getFunciones({ desde: hoyISO() })])
      .then(([peliculas, cines, funciones]) => {
        if (!ignorar) setEstado({ cargando: false, error: false, datos: { peliculas, cines, funciones } });
      })
      .catch(() => {
        if (!ignorar) setEstado({ cargando: false, error: true, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  // Slider y proximos estrenos van aparte: si fallan, la cartelera se sigue viendo (y ellos no se muestran)
  useEffect(() => {
    let ignorar = false;
    Promise.all([getDestacadas(), getProximosEstrenos()])
      .then(([destacadas, proximos]) => {
        if (!ignorar) setEstrenos({ cargando: false, destacadas, proximos });
      })
      .catch(() => {
        if (!ignorar) setEstrenos({ cargando: false, destacadas: [], proximos: [] });
      });
    return () => {
      ignorar = true;
    };
  }, []);

  const reintentar = () => {
    setEstado({ cargando: true, error: false, datos: null });
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
  // Para el estado vacio: el proximo dia en el que si hay peliculas con estos filtros
  const otroDia = dias.find((d) => d.fecha > dia && armarCartelera(datos?.peliculas ?? [], funcionesDelCine, filtros, d.fecha).length);

  const hayFiltrosExtra =
    filtros.formatos.length > 0 || filtros.idioma || filtros.generos.length > 0 || filtros.soloDestacadas || filtros.soloEstrenos;
  const quitarFiltros = () =>
    cambiarFiltros({ formatos: [], idioma: '', generos: [], soloDestacadas: false, soloEstrenos: false });

  return (
    <section className="section">
      <title>Cartelera | CineClick</title>

      {estrenos.cargando ? <EsqueletoSlider /> : <SliderDestacados destacadas={estrenos.destacadas} />}

      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Películas en cartelera</h1>
        <div className={styles.pastillas}>
          <button
            type="button"
            className={`${styles.pastilla} ${filtros.soloDestacadas ? styles.pastillaActiva : ''}`}
            aria-pressed={filtros.soloDestacadas}
            onClick={() => cambiarFiltros({ soloDestacadas: !filtros.soloDestacadas })}
          >
            <IconoEstrella />
            Destacadas
          </button>
          <button
            type="button"
            className={`${styles.pastilla} ${filtros.soloEstrenos ? styles.pastillaActiva : ''}`}
            aria-pressed={filtros.soloEstrenos}
            onClick={() => cambiarFiltros({ soloEstrenos: !filtros.soloEstrenos })}
          >
            Estrenos
          </button>
        </div>
      </div>

      <div className={styles.contexto}>
        <label htmlFor="cine-elegido">Está viendo películas de</label>{' '}
        <Selector
          id="cine-elegido"
          variante="frase"
          opciones={[{ valor: '', texto: 'TODOS LOS CINES' }, ...cines.map((c) => ({ valor: String(c.id), texto: nombreCine(c.nombre) }))]}
          valor={filtros.cineId}
          onCambiar={(cineId) => cambiarFiltros({ cineId })}
        />
      </div>

      {datos ? (
        <BarraFiltros filtros={filtros} opciones={opciones} dias={dias} dia={dia} onCambiar={cambiarFiltros} />
      ) : (
        <div className={styles.barraReservada} aria-hidden="true" />
      )}

      <p className={styles.resultado} aria-live="polite">
        {datos && cartelera.length > 0 && `${cartelera.length} ${cartelera.length === 1 ? 'película' : 'películas'}`}
      </p>

      {estado.cargando && <EsqueletoGrillaPeliculas className={styles.grilla} etiqueta="Cargando cartelera" />}
      {estado.error && <EstadoError titulo="No pudimos cargar la cartelera" onReintentar={reintentar} />}

      {datos && cartelera.length === 0 && (
        <EstadoVacio
          titulo={hayFiltrosExtra ? 'No hay películas con estos filtros' : 'No hay funciones para este día'}
          mensaje={otroDia ? `Probá con ${diaRelativo(otroDia.fecha).toLowerCase()}.` : 'Probá con otros filtros o con otro cine.'}
        >
          {otroDia && (
            <button type="button" className="btn btn-primary" onClick={() => cambiarFiltros({ dia: otroDia.fecha })}>
              Ver {diaRelativo(otroDia.fecha).toLowerCase()}
            </button>
          )}
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
          {cartelera.map(({ pelicula, funciones }) => {
            // El cine y el dia viajan en el estado de la navegacion, asi la URL queda limpia
            const detalle = { to: rutaPelicula(pelicula.titulo), state: { cineId: filtros.cineId, dia } };
            return (
              <li key={pelicula.id}>
                <PeliculaCard pelicula={pelicula} to={detalle.to} estadoEnlace={detalle.state} estreno={esEstreno(pelicula)}>
                  <HorariosDelDia
                    funciones={funciones}
                    agruparPorCine={!filtros.cineId}
                    elegidaId={elegida?.id}
                    onElegir={setElegida}
                    enlaceDetalle={detalle}
                  />
                </PeliculaCard>
              </li>
            );
          })}
        </ul>
      )}

      <ProximosEstrenos proximos={estrenos.proximos} />

      {elegida && <BarraFuncionElegida funcion={elegida} onQuitar={() => setElegida(null)} onCambiar={setElegida} />}
    </section>
  );
}
