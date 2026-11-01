import { FORMATOS_ESPECIALES, etiquetaFormato } from '../../lib/formato';
import styles from './Badges.module.css';

/**
 * Formato de proyeccion o tipo de sala: 2D, 3D, IMAX, 4D, Premium...
 *
 * Props:
 * - formato: codigo del backend (DOS_D, TRES_D, IMAX, CUATRO_D, PREMIUM...)
 * - destacado: fuerza el estilo con mas presencia. Por defecto lo tienen IMAX, 4D, Premium y XD.
 */
export default function BadgeFormato({ formato, destacado }) {
  const especial = destacado ?? FORMATOS_ESPECIALES.includes(formato);
  return <span className={`${styles.badge} ${especial ? styles.especial : ''}`}>{etiquetaFormato(formato)}</span>;
}
