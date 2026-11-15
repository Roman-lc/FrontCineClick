import { FORMATOS_ESPECIALES, etiquetaFormato } from '../../lib/formato';
import styles from './Badges.module.css';

export default function BadgeFormato({ formato, destacado }) {
  const especial = destacado ?? FORMATOS_ESPECIALES.includes(formato);
  return <span className={`${styles.badge} ${especial ? styles.especial : ''}`}>{etiquetaFormato(formato)}</span>;
}
