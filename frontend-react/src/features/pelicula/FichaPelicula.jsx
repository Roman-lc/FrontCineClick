import Poster from '../../components/ui/Poster';
import IconoGenero from '../../components/ui/IconoGenero';
import { fechaLarga } from '../../lib/fechas';
import {
  clasificacionCompleta,
  etiquetaGenero,
  formatearDuracion,
  formatearDuracionCorta,
  listarFormatos,
} from '../../lib/formato';
import styles from './pelicula.module.css';

export default function FichaPelicula({ pelicula }) {
  // Las filas sin dato no se muestran (por ejemplo, el distribuidor no existe en el modelo)
  const datos = [
    ['Formatos disponibles', listarFormatos(pelicula.formatosDisponibles)],
    ['Duración', formatearDuracion(pelicula.duracionMinutos)],
    ['Clasificación', clasificacionCompleta(pelicula.clasificacion)],
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
        {pelicula.clasificacion && (
          <span className={`${styles.pastillaPoster} ${styles.pastillaDerecha}`}>
            <span className="visually-hidden">Clasificación: </span>
            {pelicula.clasificacion}
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
