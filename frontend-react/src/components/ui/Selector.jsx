import { useEffect, useId, useRef, useState } from 'react';
import styles from './Selector.module.css';

/**
 * Desplegable unico de la app (cine, dia, formato, idioma, genero).
 *
 * Props:
 * - opciones: [{ valor, texto, deshabilitada?, nota? }]
 * - valor: el valor elegido (string) o, con `multiple`, la lista de valores elegidos
 * - onCambiar(nuevoValor): recibe un string o, con `multiple`, la lista nueva
 * - multiple: permite elegir varias opciones (el panel queda abierto al elegir)
 * - etiqueta: texto del boton. Si no se pasa, se muestra el texto de la opcion elegida
 * - etiquetaAccesible: nombre para lectores de pantalla cuando el texto del boton no alcanza
 *   (ej. "Idioma" si el boton dice "Castellano"). Si hay un <label htmlFor={id}>, no hace falta
 * - id: id del boton, para asociarlo a un <label>
 * - variante: 'segmento' (dentro de BarraSegmentos) o 'frase' (resaltado con el acento,
 *   dentro de una oracion: "Horarios en [Abasto]")
 * - activo: resalta el boton (hay un filtro aplicado)
 *
 * Teclado: con el boton enfocado, Flecha abajo / Enter / Espacio abren la lista. En la lista,
 * Flechas y Inicio/Fin mueven, Enter/Espacio eligen, Escape cierra y vuelve al boton, Tab cierra.
 */
export default function Selector({
  opciones,
  valor,
  onCambiar,
  multiple = false,
  etiqueta,
  etiquetaAccesible,
  id,
  variante = 'segmento',
  activo = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const contenedor = useRef(null);
  const lista = useRef(null);
  const idPropio = useId();
  const idBoton = id ?? `${idPropio}-boton`;
  const idLista = `${idPropio}-lista`;

  const elegida = (opcion) => (multiple ? valor.includes(opcion.valor) : opcion.valor === valor);
  const texto = etiqueta ?? opciones.find((o) => o.valor === valor)?.texto ?? '';
  const habilitadas = opciones.map((o, i) => (o.deshabilitada ? null : i)).filter((i) => i !== null);

  const abrir = () => {
    const primeraElegida = opciones.findIndex((o) => !o.deshabilitada && elegida(o));
    setActiva(primeraElegida >= 0 ? primeraElegida : (habilitadas[0] ?? 0));
    setAbierto(true);
  };

  const cerrar = (volverAlBoton = true) => {
    setAbierto(false);
    if (volverAlBoton) document.getElementById(idBoton)?.focus();
  };

  const elegir = (indice) => {
    const opcion = opciones[indice];
    if (!opcion || opcion.deshabilitada) return;
    if (multiple) {
      onCambiar(valor.includes(opcion.valor) ? valor.filter((v) => v !== opcion.valor) : [...valor, opcion.valor]);
    } else {
      onCambiar(opcion.valor);
      cerrar();
    }
  };

  // Al abrir, el foco pasa a la lista para poder moverse con el teclado
  useEffect(() => {
    if (abierto) lista.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;
    const clicAfuera = (e) => {
      if (!contenedor.current?.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', clicAfuera);
    return () => document.removeEventListener('mousedown', clicAfuera);
  }, [abierto]);

  const mover = (paso) => {
    const posicion = habilitadas.indexOf(activa);
    const siguiente = habilitadas[Math.min(habilitadas.length - 1, Math.max(0, posicion + paso))];
    if (siguiente !== undefined) setActiva(siguiente);
  };

  const teclaEnBoton = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      abrir();
    }
  };

  const teclaEnLista = (e) => {
    const acciones = {
      ArrowDown: () => mover(1),
      ArrowUp: () => mover(-1),
      Home: () => setActiva(habilitadas[0]),
      End: () => setActiva(habilitadas[habilitadas.length - 1]),
      Enter: () => elegir(activa),
      ' ': () => elegir(activa),
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
    <div className={`${styles.contenedor} ${styles[variante]}`} ref={contenedor}>
      <button
        id={idBoton}
        type="button"
        className={`${styles.boton} ${activo ? styles.activo : ''}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-label={etiquetaAccesible ? `${etiquetaAccesible}: ${texto}` : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={teclaEnBoton}
      >
        <span className={styles.texto}>{texto}</span>
        <svg className={styles.flecha} width="12" height="8" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      {abierto && (
        <ul
          id={idLista}
          ref={lista}
          className={styles.panel}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={idBoton}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={`${idLista}-${activa}`}
          onKeyDown={teclaEnLista}
        >
          {opciones.map((opcion, i) => (
            <li
              key={opcion.valor}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={elegida(opcion)}
              aria-disabled={opcion.deshabilitada || undefined}
              className={`${styles.opcion} ${i === activa ? styles.opcionActiva : ''}`}
              onMouseEnter={() => !opcion.deshabilitada && setActiva(i)}
              onClick={() => elegir(i)}
            >
              <span className={multiple ? styles.casilla : styles.marca} aria-hidden="true" />
              <span>{opcion.texto}</span>
              {opcion.nota && <span className={styles.nota}>{opcion.nota}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
