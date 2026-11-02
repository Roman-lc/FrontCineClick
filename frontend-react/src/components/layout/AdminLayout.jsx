import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import BarraAdmin from './BarraAdmin';
import { useColorDeTema } from '../../lib/useColorDeTema';
import styles from './AdminLayout.module.css';

const SECCIONES = [
  { to: '/admin', texto: 'Métricas', end: true },
  { to: '/admin/cines', texto: 'Cines' },
  { to: '/admin/salas', texto: 'Salas' },
  { to: '/admin/peliculas', texto: 'Películas' },
  { to: '/admin/funciones', texto: 'Funciones' },
  { to: '/admin/promociones', texto: 'Promociones' },
  { to: '/admin/validar', texto: 'Validar entradas' },
  { to: '/admin/arrepentimientos', texto: 'Arrepentimientos' },
  { to: '/admin/soporte', texto: 'Soporte' },
];

const claseEnlace = ({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`;

// Layout de /admin/*: tema claro (data-theme="admin"), header propio y navegacion lateral en desktop
// o desplegable en el celular. El sitio publico no se ve afectado.
export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const mainRef = useRef(null);
  const rutaAnterior = useRef(pathname);
  // El menu del celular se cierra solo al navegar (se guarda en que navegacion se abrio)
  const [abiertoEn, setAbiertoEn] = useState(null);
  const menuAbierto = abiertoEn === location.key;
  const actual = SECCIONES.find((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)));
  useColorDeTema();

  useEffect(() => {
    if (rutaAnterior.current === pathname) return;
    rutaAnterior.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  useEffect(() => {
    if (!menuAbierto) return undefined;
    const escape = (e) => e.key === 'Escape' && setAbiertoEn(null);
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuAbierto]);

  const salir = () => {
    logout();
    navigate('/');
  };

  const lista = (
    <ul className={styles.lista}>
      {SECCIONES.map((s) => (
        <li key={s.to}>
          <NavLink to={s.to} end={s.end} className={claseEnlace}>
            {s.texto}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div data-theme="admin" className={styles.admin}>
      <a href="#contenido-admin" className="skip-link">
        Saltar al contenido
      </a>
      <BarraAdmin />
      <header className={styles.cabecera}>
        <Link to="/admin" className={styles.logo}>
          CineClick <span className={styles.panel}>Panel</span>
        </Link>
        <button
          type="button"
          className={styles.botonMenu}
          aria-expanded={menuAbierto}
          aria-controls="menu-admin"
          onClick={() => setAbiertoEn(menuAbierto ? null : location.key)}
        >
          {actual?.texto ?? 'Secciones'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      {menuAbierto && (
        <nav id="menu-admin" className={styles.menuMovil} aria-label="Secciones del panel">
          {lista}
          <button type="button" className={styles.enlace} onClick={salir}>
            Cerrar sesión
          </button>
        </nav>
      )}

      <div className={styles.cuerpo}>
        <nav className={styles.lateral} aria-label="Secciones del panel">
          {lista}
          <button type="button" className={`${styles.enlace} ${styles.salir}`} onClick={salir}>
            Cerrar sesión
          </button>
        </nav>
        <main id="contenido-admin" ref={mainRef} tabIndex={-1} className={styles.contenido}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
