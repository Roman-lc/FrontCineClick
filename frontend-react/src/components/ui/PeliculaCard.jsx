import { Link } from 'react-router-dom';
import { formatearDuracionCorta, listarFormatos } from '../../lib/formato';
import IconoEstrella from './IconoEstrella';
import Poster from './Poster';
import styles from './PeliculaCard.module.css';

// children: contenido debajo de los formatos (los horarios del dia en la cartelera).
// No va adentro de un enlace para que cada horario tenga su propio clic.
// Todas las tarjetas miden lo mismo: el titulo reserva 2 lineas, los formatos 1 y los horarios
// tienen su propia altura fija (ver HorariosDelDia).
export default function PeliculaCard({ pelicula, to, estreno = false, children }) {
  const duracion = formatearDuracionCorta(pelicula.duracionMinutos);
  const formatos = listarFormatos(pelicula.formatosDisponibles);
  const poster = <Poster pelicula={pelicula} className={styles.poster} />;

  return (
    <article className={styles.card}>
      <div className={styles.posterCaja}>
        {to ? (
          // Duplica el enlace del titulo solo para el mouse: se saltea con teclado y lector de pantalla
          <Link to={to} className={styles.enlacePoster} tabIndex={-1} aria-hidden="true">
            {poster}
          </Link>
        ) : (
          poster
        )}
        {pelicula.destacada && (
          <span className={styles.badgeDestacada} title="Destacada">
            <IconoEstrella />
            <span className="visually-hidden">Destacada</span>
          </span>
        )}
        {duracion && (
          <span className={styles.badgeDuracion}>
            <span className="visually-hidden">Duración: </span>
            {duracion}
          </span>
        )}
        {estreno && <span className={styles.badgeEstreno}>Estreno</span>}
      </div>

      <div className={styles.info}>
        <div className={styles.filaTitulo}>
          <h3 className={styles.titulo}>{to ? <Link to={to}>{pelicula.titulo}</Link> : pelicula.titulo}</h3>
          {pelicula.clasificacion && (
            <span className={styles.calificacion} title="Calificación">
              {pelicula.clasificacion}
            </span>
          )}
        </div>
        <p className={styles.formatos} title={formatos || undefined}>
          {formatos}
        </p>
        {children}
      </div>

    </article>
  );
}
