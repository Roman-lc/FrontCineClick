import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import MenuCuenta from './MenuCuenta';
import styles from './Header.module.css';

const SECCIONES = [
  { to: '/', texto: 'Cartelera', end: true },
  { to: '/cines', texto: 'Cines' },
  { to: '/promociones', texto: 'Promociones' },
];

const claseEnlace = ({ isActive }) => `${styles.seccion} ${isActive ? styles.activa : ''}`;

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Panel del celular: se guarda en que navegacion se abrio, asi al navegar queda cerrado solo
  const [abiertoEn, setAbiertoEn] = useState(null);
  const panelAbierto = abiertoEn === location.key;

  const salir = () => {
    setAbiertoEn(null);
    logout();
    navigate('/');
  };

  // Con el panel abierto el fondo no se desplaza, y Escape lo cierra
  useEffect(() => {
    if (!panelAbierto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (e) => e.key === 'Escape' && setAbiertoEn(null);
    document.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', escape);
    };
  }, [panelAbierto]);

  return (
    <header>
      <nav className={styles.barra} aria-label="Principal">
        <Link to="/" className={styles.logo}>
          CineClick
        </Link>

        <ul className={styles.secciones}>
          {SECCIONES.map((s) => (
            <li key={s.to}>
              <NavLink to={s.to} end={s.end} className={claseEnlace}>
                {s.texto}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.extremo}>
          {user ? (
            <MenuCuenta user={user} isAdmin={isAdmin} onSalir={salir} />
          ) : (
            <Link to="/login" className={`btn btn-primary ${styles.ingresar}`}>
              Ingresar
            </Link>
          )}
        </div>

        <button
          type="button"
          className={styles.hamburguesa}
          aria-expanded={panelAbierto}
          aria-controls="menu-movil"
          aria-label={panelAbierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbiertoEn(panelAbierto ? null : location.key)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            {panelAbierto ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {panelAbierto && (
        <div id="menu-movil" className={styles.panelMovil}>
          <ul className={styles.listaMovil}>
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <NavLink to={s.to} end={s.end} className={claseEnlace}>
                  {s.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <hr className={styles.divisorMovil} />
          {user ? (
            <ul className={styles.listaMovil} aria-label="Cuenta">
              <li className={styles.usuarioMovil}>{user.nombre || user.email}</li>
              {!isAdmin && (
                <li>
                  <NavLink to="/mis-compras" className={claseEnlace}>
                    Mis compras
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={claseEnlace}>
                    Panel de administración
                  </NavLink>
                </li>
              )}
              <li>
                <button type="button" className={styles.seccion} onClick={salir}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          ) : (
            <Link to="/login" className={`btn btn-primary ${styles.ingresarMovil}`}>
              Ingresar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
