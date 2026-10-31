import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Poster from '../../components/ui/Poster';
import { fechaDiaMes } from '../../lib/fechas';
import { formatearDuracion } from '../../lib/formato';
import { posterGrande } from '../../lib/poster';
import { useAutoplay } from '../../lib/useAutoplay';
import { useMediaQuery } from '../../lib/useMediaQuery';
import styles from './slider.module.css';

const DURACION_MS = 6000;
// Distancia minima (px) para que un arrastre cuente como swipe
const UMBRAL_SWIPE = 50;

const ETIQUETAS = { PREVENTA: 'Preventa', NOVEDAD: 'Nuevo', PROXIMAMENTE: 'Próximamente' };
const BOTONES = { PREVENTA: 'Comprar entradas', NOVEDAD: 'Ver horarios', PROXIMAMENTE: 'Ver detalle' };

// destacadas: [{ pelicula, categoria }] de GET /api/peliculas/destacadas
export default function SliderDestacados({ destacadas }) {
  const total = destacadas.length;
  const [actual, setActual] = useState(0);
  const [delUsuario, setDelUsuario] = useState(false);
  const [mouseEncima, setMouseEncima] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const sinMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)');
  const inicioSwipe = useRef(null);

  const ir = (indice, porUsuario) => {
    setActual((indice + total) % total);
    setDelUsuario(porUsuario);
  };

  const corriendo = useAutoplay({
    activo: total > 1 && !sinMovimiento && !mouseEncima && !conFoco,
    duracion: DURACION_MS,
    reinicio: actual,
    alCumplirse: () => ir(actual + 1, false),
  });

  if (total === 0) return null;

  const teclas = (e) => {
    if (e.key === 'ArrowLeft') ir(actual - 1, true);
    else if (e.key === 'ArrowRight') ir(actual + 1, true);
    else return;
    e.preventDefault();
  };

  const terminarSwipe = (e) => {
    if (inicioSwipe.current === null) return;
    const distancia = e.clientX - inicioSwipe.current;
    inicioSwipe.current = null;
    if (Math.abs(distancia) >= UMBRAL_SWIPE) ir(actual + (distancia < 0 ? 1 : -1), true);
  };

  return (
    <section
      className={styles.slider}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Películas destacadas"
      tabIndex={0}
      onKeyDown={teclas}
      onMouseEnter={() => setMouseEncima(true)}
      onMouseLeave={() => setMouseEncima(false)}
      onFocus={() => setConFoco(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setConFoco(false)}
    >
      <div
        className={styles.ventana}
        onPointerDown={(e) => (inicioSwipe.current = e.clientX)}
        onPointerUp={terminarSwipe}
        onPointerCancel={() => (inicioSwipe.current = null)}
      >
        <div
          className={styles.pista}
          style={{ transform: `translateX(-${actual * 100}%)` }}
          aria-live={delUsuario ? 'polite' : 'off'}
        >
          {destacadas.map((destacada, i) => (
            <Diapositiva key={destacada.pelicula.id} destacada={destacada} indice={i} total={total} activa={i === actual} />
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.flecha} ${styles.anterior}`}
            aria-label="Película anterior"
            onClick={() => ir(actual - 1, true)}
          >
            <Flecha />
          </button>
          <button
            type="button"
            className={`${styles.flecha} ${styles.siguiente}`}
            aria-label="Película siguiente"
            onClick={() => ir(actual + 1, true)}
          >
            <Flecha />
          </button>
          <div className={styles.puntos}>
            {destacadas.map(({ pelicula }, i) => (
              <button
                key={pelicula.id}
                type="button"
                className={styles.punto}
                aria-label={`Ir a la película ${i + 1}: ${pelicula.titulo}`}
                aria-current={i === actual ? 'true' : undefined}
                onClick={() => ir(i, true)}
              >
                <span className={styles.barra}>
                  {i === actual && (
                    <span
                      key={actual}
                      className={styles.progreso}
                      style={{ animationDuration: `${DURACION_MS}ms`, animationPlayState: corriendo ? 'running' : 'paused' }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Diapositiva({ destacada, indice, total, activa }) {
  const { pelicula, categoria } = destacada;
  const poster = posterGrande(pelicula.urlPoster);
  const datos = [
    pelicula.fechaEstreno && `Estreno ${fechaDiaMes(pelicula.fechaEstreno)}`,
    formatearDuracion(pelicula.duracionMinutos),
    pelicula.clasificacion,
  ].filter(Boolean);

  return (
    <div
      className={styles.diapositiva}
      role="group"
      aria-roledescription="diapositiva"
      aria-label={`${indice + 1} de ${total}`}
      aria-hidden={!activa}
      inert={!activa}
    >
      {/* Sin imagen horizontal: el mismo poster, ampliado y desenfocado, hace de fondo */}
      {poster && <div className={styles.fondo} style={{ backgroundImage: `url("${poster}")` }} />}
      <div className={styles.capa} />
      <div className={styles.posterCaja}>
        <Poster pelicula={{ ...pelicula, urlPoster: poster }} className={styles.poster} cargaDiferida={indice > 0} />
      </div>
      <div className={styles.contenido}>
        <span className={`${styles.badge} ${styles[categoria.toLowerCase()]}`}>{ETIQUETAS[categoria]}</span>
        <h2 className={styles.titulo}>{pelicula.titulo}</h2>
        <p className={styles.datos}>{datos.join(' · ')}</p>
        <p className={styles.sinopsis}>{pelicula.sinopsis}</p>
        <Link to={`/peliculas/${pelicula.id}`} className={`btn btn-primary ${styles.boton}`}>
          {BOTONES[categoria]}
        </Link>
      </div>
    </div>
  );
}

function Flecha() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
