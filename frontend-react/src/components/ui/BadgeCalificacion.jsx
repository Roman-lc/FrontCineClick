import { clasificacionCompleta, etiquetaClasificacion } from '../../lib/formato';
import styles from './Badges.module.css';

/**
 * Calificacion de la pelicula (ATP, +13, +16, +18). El texto completo queda como title y para
 * lectores de pantalla ("Apta para mayores de 13 años").
 *
 * Props:
 * - clasificacion: el valor del backend ('ATP', 'MAS_13'...). Sin valor no se muestra nada.
 */
export default function BadgeCalificacion({ clasificacion }) {
  if (!clasificacion) return null;
  const completa = clasificacionCompleta(clasificacion);
  return (
    <span className={styles.calificacion} title={completa}>
      <span aria-hidden="true">{etiquetaClasificacion(clasificacion)}</span>
      <span className="visually-hidden">{completa}</span>
    </span>
  );
}
