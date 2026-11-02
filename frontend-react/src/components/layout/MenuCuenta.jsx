import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

// Boton con el nombre del usuario que abre el menu de la cuenta (patron "menu button").
// Teclado: Flecha abajo / Enter / Espacio abren y enfocan la primera opcion; Flechas, Inicio y Fin
// se mueven; Escape cierra y vuelve al boton; Tab cierra. Tambien se cierra al hacer clic afuera
// y al navegar.
export default function MenuCuenta({ user, isAdmin, onSalir }) {
  const location = useLocation();
  // Se guarda en que navegacion se abrio: al cambiar de pagina el menu queda cerrado solo
  const [abiertoEn, setAbiertoEn] = useState(null);
  const abierto = abiertoEn === location.key;
  const contenedor = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const idBoton = `${id}-boton`;

  const opciones = () => [...(menu.current?.querySelectorAll('[role="menuitem"]') ?? [])];
  const cerrar = (volverAlBoton = true) => {
    setAbiertoEn(null);
    if (volverAlBoton) document.getElementById(idBoton)?.focus();
  };

  useEffect(() => {
    if (abierto) opciones()[0]?.focus();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;
    const clicAfuera = (e) => {
      if (!contenedor.current?.contains(e.target)) setAbiertoEn(null);
    };
    document.addEventListener('mousedown', clicAfuera);
    return () => document.removeEventListener('mousedown', clicAfuera);
  }, [abierto]);

  const teclaEnBoton = (e) => {
    if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setAbiertoEn(location.key);
    }
  };

  const teclaEnMenu = (e) => {
    const lista = opciones();
    const actual = lista.indexOf(document.activeElement);
    const ir = (i) => lista[(i + lista.length) % lista.length]?.focus();
    const acciones = {
      ArrowDown: () => ir(actual + 1),
      ArrowUp: () => ir(actual - 1),
      Home: () => ir(0),
      End: () => ir(lista.length - 1),
      Escape: () => cerrar(),
    };
    if (e.key === 'Tab') {
      cerrar(false);
      return;
    }
    if (acciones[e.key]) {
      e.preventDefault();
      acciones[e.key]();
    }
  };

  return (
    <div className={styles.cuenta} ref={contenedor}>
      <button
        id={idBoton}
        type="button"
        className={styles.botonCuenta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={`${id}-menu`}
        onClick={() => (abierto ? cerrar() : setAbiertoEn(location.key))}
        onKeyDown={teclaEnBoton}
      >
        <span className={styles.nombreUsuario}>{user.nombre || user.email}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true" focusable="false" className={styles.flechaCuenta}>
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      {abierto && (
        <ul id={`${id}-menu`} ref={menu} className={styles.menuCuenta} role="menu" aria-labelledby={idBoton} onKeyDown={teclaEnMenu}>
          {!isAdmin && (
            <li role="none">
              <Link role="menuitem" tabIndex={-1} to="/mis-compras" className={styles.opcionMenu}>
                Mis compras
              </Link>
            </li>
          )}
          {isAdmin && (
            <li role="none">
              <Link role="menuitem" tabIndex={-1} to="/admin" className={styles.opcionMenu}>
                Panel de administración
              </Link>
            </li>
          )}
          <li role="none">
            <Link role="menuitem" tabIndex={-1} to="/soporte" className={styles.opcionMenu}>
              Ayuda
            </Link>
          </li>
          <li role="separator" className={styles.divisor} />
          <li role="none">
            <button
              role="menuitem"
              tabIndex={-1}
              type="button"
              className={styles.opcionMenu}
              onClick={() => {
                cerrar(false);
                onSalir();
              }}
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
