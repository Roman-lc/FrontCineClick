import { Link, useLocation } from 'react-router-dom';
import styles from './AyudaFlotante.module.css';

// Boton fijo abajo a la derecha que lleva a /soporte. No aparece en la compra (/compra/*) ni en la
// misma pagina de ayuda; el panel (/admin/*) tiene su propio layout y no lo incluye.
export default function AyudaFlotante() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/compra/') || pathname === '/soporte') return null;
  return (
    <Link to="/soporte" className={styles.ayuda}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
      </svg>
      Ayuda
    </Link>
  );
}
