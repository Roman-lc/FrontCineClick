import styles from './admin.module.css';

export default function BadgeEstado({ activo, texto }) {
  return <span className={`${styles.badge} ${activo ? styles.badgeActivo : styles.badgeInactivo}`}>{texto ?? (activo ? 'Activo' : 'Inactivo')}</span>;
}
