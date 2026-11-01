import BadgeCalificacion from '../../components/ui/BadgeCalificacion';
import BadgeFormato from '../../components/ui/BadgeFormato';
import Poster from '../../components/ui/Poster';
import IconoGenero from '../../components/ui/IconoGenero';
import { fechaLarga } from '../../lib/fechas';
import {
  ORDEN_FORMATOS,
  clasificacionCompleta,
  etiquetaGenero,
  formatearDuracion,
  formatearDuracionCorta,
} from '../../lib/formato';
import styles from './pelicula.module.css';

export default function FichaPelicula({ pelicula }) {
  // Las filas sin dato no se muestran (por ejemplo, el distribuidor no existe en el modelo)
  const formatos = [...(pelicula.formatosDisponibles ?? [])].sort((a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b));
  const datos = [
    [
      'Formatos disponibles',
      formatos.length > 0 && (
        <span key="formatos" className={styles.badges}>
          {formatos.map((f) => (
            <BadgeFormato key={f} formato={f} />
          ))}
        </span>
      ),
    ],
    ['Duración', formatearDuracion(pelicula.duracionMinutos)],
    [
      'Clasificación',
      pelicula.clasificacion && (
        <span key="clasificacion" className={styles.badges}>
          <BadgeCalificacion clasificacion={pelicula.clasificacion} />
          <span aria-hidden="true">{clasificacionCompleta(pelicula.clasificacion)}</span>
        </span>
      ),
    ],
    ['Fecha de estreno', pelicula.fechaEstreno && fechaLarga(pelicula.fechaEstreno)],
    ['Distribuidor', pelicula.distribuidor],
  ].filter(([, valor]) => valor);

  return (
    <div className={styles.ficha}>
      <h1 className={styles.tituloGrande}>{pelicula.titulo}</h1>

      <div className={styles.posterCaja}>
        <Poster pelicula={pelicula} cargaDiferida={false} />
        {pelicula.duracionMinutos > 0 && (
          <span className={`${styles.pastillaPoster} ${styles.pastillaIzquierda}`}>
            <span className="visually-hidden">Duración: </span>
            {formatearDuracionCorta(pelicula.duracionMinutos)}
          </span>
        )}
      </div>

      {pelicula.genero && (
        <p className={styles.genero}>
          <IconoGenero />
          {etiquetaGenero(pelicula.genero)}
        </p>
      )}

      {pelicula.sinopsis && <p className={styles.sinopsis}>{pelicula.sinopsis}</p>}

      <dl className={styles.datos}>
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className={styles.fila}>
            <dt>{etiqueta}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
