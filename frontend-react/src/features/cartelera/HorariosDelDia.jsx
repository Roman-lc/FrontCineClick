import { Link } from 'react-router-dom';
import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdiomaCorta } from '../../lib/formato';
import styles from './cartelera.module.css';

// Horarios de una pelicula para el dia elegido. Con "todos los cines" se agrupan por cine.
export default function HorariosDelDia({ funciones, agruparPorCine }) {
  const grupos = agruparPorCine ? agruparPorNombreDeCine(funciones) : [['', funciones]];
  return (
    <div className={styles.horarios}>
      {grupos.map(([cine, lista]) => (
        <div key={cine || 'horarios'}>
          {cine && <p className={styles.horariosCine}>{cine}</p>}
          <ul className={styles.chips}>
            {lista.map((funcion) => (
              <li key={funcion.id}>
                <ChipHorario funcion={funcion} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChipHorario({ funcion }) {
  const hora = horaCorta(funcion.fechaHoraInicio);
  const formato = etiquetaFormato(funcion.formato);

  if (funcion.butacasLibres === 0) {
    return (
      <span className={`${styles.chip} ${styles.chipAgotado}`} aria-disabled="true">
        <span className={styles.chipHora}>{hora}</span>
        <span className={styles.chipDetalle}>Agotada</span>
      </span>
    );
  }
  return (
    <Link
      to={`/compra/${funcion.id}`}
      className={styles.chip}
      aria-label={`Comprar para las ${hora}, ${formato}, ${funcion.idioma}, ${funcion.cineNombre}`}
    >
      <span className={styles.chipHora}>{hora}</span>
      <span className={styles.chipDetalle}>
        {formato} · {etiquetaIdiomaCorta(funcion.idioma)}
      </span>
    </Link>
  );
}

function agruparPorNombreDeCine(funciones) {
  const grupos = new Map();
  for (const f of funciones) {
    if (!grupos.has(f.cineNombre)) grupos.set(f.cineNombre, []);
    grupos.get(f.cineNombre).push(f);
  }
  return [...grupos.entries()];
}
