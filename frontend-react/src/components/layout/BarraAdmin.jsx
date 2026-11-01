import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import styles from './BarraAdmin.module.css';

// Franja fija de la sesion de administrador, arriba de todo en el sitio y en el panel.
// No se puede cerrar: deja claro en todo momento con que cuenta se esta navegando.
export default function BarraAdmin() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const enPanel = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <div className={styles.barra} data-barra-admin>
      <p className={styles.sesion}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        </svg>
        <span className={styles.texto}>
          Sesión de administrador<span className={styles.nombre}> · {user?.nombre || user?.email}</span>
        </span>
      </p>
      {enPanel ? (
        <Link to="/" className={styles.enlace}>
          Ver el sitio
        </Link>
      ) : (
        <Link to="/admin" className={styles.enlace}>
          Ir al panel
        </Link>
      )}
    </div>
  );
}
