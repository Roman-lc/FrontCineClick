import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdiomaCorta } from '../../lib/formato';
import styles from './cartelera.module.css';

// Horarios de una pelicula para el dia elegido, en una zona de alto fijo para que todas las
// tarjetas midan lo mismo:
// - con un cine elegido: hasta 2 filas de chips; si no entran, el ultimo lugar es "+N" (va al detalle);
// - con "todos los cines": solo el cine con la funcion mas proxima (1 fila) y "y N cines más".
// Tocar un horario lo elige (onElegir) y la pagina muestra la barra para comprar.
export default function HorariosDelDia({ funciones, agruparPorCine, elegidaId, onElegir, enlaceDetalle }) {
  const [zona, porFila] = useChipsPorFila();
  const chip = { elegidaId, onElegir, enlaceDetalle };

  if (funciones.length === 0) {
    return (
      <div ref={zona} className={`${styles.horarios} ${styles.sinFunciones}`}>
        <p>Sin funciones hoy</p>
      </div>
    );
  }

  if (!agruparPorCine) {
    return (
      <div ref={zona} className={styles.horarios}>
        <ListaChips funciones={funciones} maximo={porFila * 2} {...chip} />
      </div>
    );
  }

  // Las funciones llegan ordenadas por hora: el primer cine es el de la funcion mas proxima
  const [[cine, delCine], ...otros] = agruparPorNombreDeCine(funciones);
  return (
    <div ref={zona} className={styles.horarios}>
      <p className={styles.horariosCine}>{cine}</p>
      <ListaChips funciones={delCine} maximo={porFila} {...chip} />
      {otros.length > 0 && (
        <Link to={enlaceDetalle} className={styles.masCines}>
          y {otros.length} {otros.length === 1 ? 'cine' : 'cines'} más ›
        </Link>
      )}
    </div>
  );
}

function ListaChips({ funciones, maximo, elegidaId, onElegir, enlaceDetalle }) {
  const sobran = funciones.length > maximo;
  const visibles = sobran ? funciones.slice(0, Math.max(0, maximo - 1)) : funciones;
  const resto = funciones.length - visibles.length;
  return (
    <ul className={styles.chips}>
      {visibles.map((funcion) => (
        <li key={funcion.id}>
          <ChipHorario funcion={funcion} elegida={funcion.id === elegidaId} onElegir={onElegir} />
        </li>
      ))}
      {sobran && (
        <li>
          <Link
            to={enlaceDetalle}
            className={`${styles.chip} ${styles.chipMas}`}
            aria-label={`Ver ${resto} ${resto === 1 ? 'horario' : 'horarios'} más`}
          >
            +{resto}
          </Link>
        </li>
      )}
    </ul>
  );
}

function ChipHorario({ funcion, elegida, onElegir }) {
  const hora = horaCorta(funcion.fechaHoraInicio);
  const formato = etiquetaFormato(funcion.formato);

  if (funcion.butacasLibres === 0) {
    return (
      <span className={`${styles.chip} ${styles.chipAgotado}`} aria-disabled="true">
        <span className={styles.chipHora}>{hora}</span>
        <span className={styles.chipDetalle}>Agotada</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={elegida}
      onClick={() => onElegir(elegida ? null : funcion)}
      aria-label={`${hora}, ${formato}, ${funcion.idioma}, ${funcion.cineNombre}`}
    >
      <span className={styles.chipHora}>{hora}</span>
      <span className={styles.chipDetalle}>
        {formato} · {etiquetaIdiomaCorta(funcion.idioma)}
      </span>
    </button>
  );
}

// Cuantos chips entran por fila segun el ancho real de la zona. El ancho del chip y la separacion
// salen del CSS (--ancho-chip y gap), asi este calculo y el dibujo no se desfasan.
function useChipsPorFila() {
  const zona = useRef(null);
  const [porFila, setPorFila] = useState(3);
  useEffect(() => {
    const elemento = zona.current;
    if (!elemento) return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      const estilos = getComputedStyle(elemento);
      const anchoChip = parseFloat(estilos.getPropertyValue('--ancho-chip')) || 72;
      const separacion = parseFloat(estilos.getPropertyValue('--separacion-chips')) || 6;
      setPorFila(Math.max(1, Math.floor((entrada.contentRect.width + separacion) / (anchoChip + separacion))));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);
  return [zona, porFila];
}

function agruparPorNombreDeCine(funciones) {
  const grupos = new Map();
  for (const f of funciones) {
    if (!grupos.has(f.cineNombre)) grupos.set(f.cineNombre, []);
    grupos.get(f.cineNombre).push(f);
  }
  return [...grupos.entries()];
}
