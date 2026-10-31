import { useEffect, useId, useRef, useState } from 'react';
import styles from './Desplegable.module.css';

// Boton que abre un panel con opciones. children puede ser una funcion que recibe `cerrar`,
// para las listas en las que elegir una opcion tiene que cerrar el panel.
export default function Desplegable({ etiqueta, activo = false, children }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const idPanel = useId();
  const idBoton = `${idPanel}-boton`;

  // Al cerrar desde adentro del panel el foco vuelve al boton, para no perderlo con el teclado
  const cerrar = () => {
    setAbierto(false);
    document.getElementById(idBoton)?.focus();
  };

  useEffect(() => {
    if (!abierto) return;
    const cerrarSiClicAfuera = (e) => {
      if (!contenedor.current?.contains(e.target)) setAbierto(false);
    };
    const cerrarConEscape = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        document.getElementById(idBoton)?.focus();
      }
    };
    document.addEventListener('mousedown', cerrarSiClicAfuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('mousedown', cerrarSiClicAfuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto, idBoton]);

  return (
    <div className={styles.contenedor} ref={contenedor}>
      <button
        id={idBoton}
        type="button"
        className={`${styles.boton} ${activo ? styles.activo : ''}`}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((valor) => !valor)}
      >
        {etiqueta}
        <span className={styles.flecha} aria-hidden="true">
          ▾
        </span>
      </button>
      {abierto && (
        <div id={idPanel} className={styles.panel}>
          {typeof children === 'function' ? children(cerrar) : children}
        </div>
      )}
    </div>
  );
}
