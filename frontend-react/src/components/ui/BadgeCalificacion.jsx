import { clasificacionCompleta, etiquetaClasificacion } from '../../lib/formato';
import styles from './Badges.module.css';

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
