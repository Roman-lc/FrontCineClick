import { Link } from 'react-router-dom';
import { ORDEN_FORMATOS, formatearDuracionCorta } from '../../lib/formato';
import BadgeCalificacion from './BadgeCalificacion';
import BadgeFormato from './BadgeFormato';
import IconoEstrella from './IconoEstrella';
import Poster from './Poster';
import styles from './PeliculaCard.module.css';

// children: contenido debajo de los formatos (los horarios del dia en la cartelera).
// No va adentro de un enlace para que cada horario tenga su propio clic.
// Todas las tarjetas miden lo mismo: el titulo reserva 2 lineas, los formatos 1 y los horarios
// tienen su propia altura fija (ver HorariosDelDia).
export default function PeliculaCard({ pelicula, to, estadoEnlace, estreno = false, children }) {
  const duracion = formatearDuracionCorta(pelicula.duracionMinutos);
  const formatos = [...(pelicula.formatosDisponibles ?? [])].sort((a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b));
  const poster = <Poster pelicula={pelicula} className={styles.poster} />;

  return (
    <article className={styles.card}>
      <div className={styles.posterCaja}>
        {to ? (
          // Duplica el enlace del titulo solo para el mouse: se saltea con teclado y lector de pantalla
          <Link to={to} state={estadoEnlace} className={styles.enlacePoster} tabIndex={-1} aria-hidden="true">
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
          <h3 className={styles.titulo}>{to ? <Link to={to} state={estadoEnlace}>{pelicula.titulo}</Link> : pelicula.titulo}</h3>
          <BadgeCalificacion clasificacion={pelicula.clasificacion} />
        </div>
        <p className={styles.formatos}>
          <span className="visually-hidden">Formatos: </span>
          {formatos.map((f) => (
            <BadgeFormato key={f} formato={f} />
          ))}
        </p>
        {children}
      </div>

    </article>
  );
}
