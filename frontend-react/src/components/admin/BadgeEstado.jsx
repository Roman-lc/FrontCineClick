import styles from './admin.module.css';

// "Activo" / "Inactivo" (o los textos que se pasen, ej. "Programada" / "Cancelada")
export default function BadgeEstado({ activo, texto }) {
  return <span className={`${styles.badge} ${activo ? styles.badgeActivo : styles.badgeInactivo}`}>{texto ?? (activo ? 'Activo' : 'Inactivo')}</span>;
}
