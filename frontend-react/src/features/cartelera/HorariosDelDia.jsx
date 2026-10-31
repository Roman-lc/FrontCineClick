import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdiomaCorta } from '../../lib/formato';
import styles from './cartelera.module.css';

// Horarios de una pelicula para el dia elegido. Con "todos los cines" se agrupan por cine.
// Tocar un horario lo elige (onElegir) y la pagina muestra la barra para comprar.
export default function HorariosDelDia({ funciones, agruparPorCine, elegidaId, onElegir }) {
  const grupos = agruparPorCine ? agruparPorNombreDeCine(funciones) : [['', funciones]];
  return (
    <div className={styles.horarios}>
      {grupos.map(([cine, lista]) => (
        <div key={cine || 'horarios'}>
          {cine && <p className={styles.horariosCine}>{cine}</p>}
          <ul className={styles.chips}>
            {lista.map((funcion) => (
              <li key={funcion.id}>
                <ChipHorario funcion={funcion} elegida={funcion.id === elegidaId} onElegir={onElegir} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChipHorario({ funcion, elegida, onElegir }) {
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
    <button
      type="button"
      className={styles.chip}
      aria-pressed={elegida}
      onClick={() => onElegir(elegida ? null : funcion)}
      aria-label={`${hora}, ${formato}, ${funcion.idioma}, ${funcion.cineNombre}`}
    >
      <span className={styles.chipHora}>{hora}</span>
      <span className={styles.chipDetalle}>
        {formato} · {etiquetaIdiomaCorta(funcion.idioma)}
      </span>
    </button>
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
