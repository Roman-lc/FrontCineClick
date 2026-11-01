import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BadgeCalificacion from '../../components/ui/BadgeCalificacion';
import BadgeFormato from '../../components/ui/BadgeFormato';
import ChipHorario from '../../components/ui/ChipHorario';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../../components/ui/Esqueletos';
import Poster from '../../components/ui/Poster';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getPeliculas } from '../../services/peliculas';
import { ApiError } from '../../services/http';
import { diaRelativo, fechaDeFuncion, funcionVigente, hoyISO, sumarDiasISO } from '../../lib/fechas';
import { etiquetaGenero, etiquetaIdioma, formatearDuracion, nombreCine } from '../../lib/formato';
import { aSlug, rutaPelicula } from '../../lib/slug';
import BarraFuncionElegida from '../compra/BarraFuncionElegida';
import SelectorDias from '../pelicula/SelectorDias';
import { agruparPorFormatoEIdioma } from '../pelicula/horarios';
import DatosCine from './DatosCine';
import FotoCine from './FotoCine';
import { formatosDelCine, horarioDelCine, urlComoLlegar, urlMapaEmbebido } from './cines';
import styles from './cines.module.css';

const DIAS = 7;

// /cines/<slug del nombre>: datos del cine, mapa y cartelera dia por dia. La key reinicia al cambiar de cine.
export default function CinePage() {
  const { slug } = useParams();
  return <CarteleraDelCine key={slug} slug={slug} />;
}

function CarteleraDelCine({ slug }) {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });
  const [diaElegido, setDiaElegido] = useState(null);
  const [elegida, setElegida] = useState(null);

  useEffect(() => {
    let ignorar = false;
    Promise.all([getCines(), getPeliculas()])
      .then(async ([cines, peliculas]) => {
        const cine = cines.find((c) => c.activo !== false && aSlug(c.nombre) === slug);
        if (!cine) throw new ApiError(404, 'Cine no encontrado');
        const funciones = await getFunciones({ cineId: cine.id });
        if (!ignorar) setEstado({ cargando: false, error: null, datos: { cine, peliculas, funciones } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [slug, intento]);

  if (estado.cargando) {
    return (
      <section className="section">
        <div className={`${styles.banner} ${styles.bannerEsqueleto}`} aria-hidden="true" />
        <EsqueletoFilas cantidad={3} alto={150} etiqueta="Cargando cartelera" />
      </section>
    );
  }

  if (estado.error) {
    return (
      <section className="section">
        {estado.error.status === 404 ? (
          <EstadoVacio titulo="No encontramos ese cine" mensaje="Puede que haya cambiado de nombre o que ya no esté activo.">
            <Link to="/cines" className="btn btn-primary">
              Ver todos los cines
            </Link>
          </EstadoVacio>
        ) : (
          <EstadoError
            titulo="No pudimos cargar la cartelera del cine"
            onReintentar={() => {
              setEstado({ cargando: true, error: null, datos: null });
              setIntento((n) => n + 1);
            }}
          />
        )}
      </section>
    );
  }

  const { cine, peliculas, funciones } = estado.datos;
  const nombre = nombreCine(cine.nombre);
  const vigentes = funciones.filter(funcionVigente);
  const dias = Array.from({ length: DIAS }, (_, i) => sumarDiasISO(hoyISO(), i));
  const conFunciones = new Set(vigentes.map(fechaDeFuncion));
  const dia = diaElegido ?? dias.find((d) => conFunciones.has(d)) ?? dias[0];
  const otroDia = dias.find((d) => d > dia && conFunciones.has(d));
  const cartelera = carteleraDelDia(vigentes, peliculas, dia);

  return (
    <section className="section">
      <title>{`${nombre} | CineClick`}</title>
      <Link to="/cines" className={styles.volver}>
        ‹ Todos los cines
      </Link>

      <header className={styles.cabeceraCine}>
        <FotoCine cine={cine} className={styles.banner} cargaDiferida={false} />
        <h1 className={styles.titulo}>{nombre}</h1>
        <DatosCine cine={cine} horario={horarioDelCine(funciones)} formatos={formatosDelCine(cine, funciones)} />
      </header>

      {/* Si el mapa no carga, el enlace "Cómo llegar" sigue a la vista debajo */}
      <div className={styles.mapa}>
        <iframe
          src={urlMapaEmbebido(cine)}
          title={`Mapa con la ubicación de ${nombre}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className={styles.mapaEnlace}>
        <a href={urlComoLlegar(cine)} target="_blank" rel="noopener noreferrer" className={styles.comoLlegar}>
          Cómo llegar ›<span className="visually-hidden"> (se abre en otra pestaña)</span>
        </a>
      </p>

      <h2 className={styles.subtitulo}>Cartelera</h2>
      <SelectorDias dias={dias} valor={dia} onCambiar={setDiaElegido} />

      {cartelera.length === 0 ? (
        <EstadoVacio
          titulo="No hay funciones para este día"
          mensaje={otroDia ? `Probá con ${diaRelativo(otroDia).toLowerCase()}.` : `${nombre} todavía no tiene funciones programadas.`}
        >
          {otroDia ? (
            <button type="button" className="btn btn-primary" onClick={() => setDiaElegido(otroDia)}>
              Ver {diaRelativo(otroDia).toLowerCase()}
            </button>
          ) : (
            <Link to="/cines" className="btn btn-primary">
              Ver otros cines
            </Link>
          )}
        </EstadoVacio>
      ) : (
        <ul className={styles.peliculas}>
          {cartelera.map(({ pelicula, funciones: delDia }) => {
            const enlace = { to: rutaPelicula(pelicula.titulo), state: { cineId: String(cine.id), dia } };
            const datos = [formatearDuracion(pelicula.duracionMinutos), etiquetaGenero(pelicula.genero)];
            return (
              <li key={pelicula.id} className={styles.pelicula}>
                <Link to={enlace.to} state={enlace.state} className={styles.posterEnlace} tabIndex={-1} aria-hidden="true">
                  <Poster pelicula={pelicula} className={styles.poster} />
                </Link>
                <div className={styles.peliculaInfo}>
                  <h3 className={styles.peliculaTitulo}>
                    <Link to={enlace.to} state={enlace.state}>
                      {pelicula.titulo}
                    </Link>
                  </h3>
                  <p className={styles.peliculaDatos}>
                    <BadgeCalificacion clasificacion={pelicula.clasificacion} />
                    <span>{datos.filter(Boolean).join(' · ')}</span>
                  </p>
                  {agruparPorFormatoEIdioma(delDia).map((grupo) => (
                    <div key={`${grupo.formato}|${grupo.idioma}`} className={styles.grupo}>
                      <p className={styles.grupoTitulo}>
                        <BadgeFormato formato={grupo.formato} /> · {etiquetaIdioma(grupo.idioma).toUpperCase()}
                      </p>
                      <ul className={styles.chips}>
                        {grupo.funciones.map((funcion) => (
                          <li key={funcion.id}>
                            <ChipHorario funcion={funcion} elegida={funcion.id === elegida?.id} onElegir={setElegida} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {elegida && <BarraFuncionElegida funcion={elegida} onQuitar={() => setElegida(null)} />}
    </section>
  );
}

// Peliculas con funciones ese dia (destacadas primero, despues por titulo), cada una con sus funciones
function carteleraDelDia(funciones, peliculas, dia) {
  const porPelicula = new Map();
  for (const f of funciones) {
    if (fechaDeFuncion(f) !== dia) continue;
    if (!porPelicula.has(f.peliculaId)) porPelicula.set(f.peliculaId, []);
    porPelicula.get(f.peliculaId).push(f);
  }
  return peliculas
    .filter((p) => porPelicula.has(p.id))
    .sort((a, b) => Number(b.destacada) - Number(a.destacada) || a.titulo.localeCompare(b.titulo))
    .map((pelicula) => ({ pelicula, funciones: porPelicula.get(pelicula.id) }));
}
