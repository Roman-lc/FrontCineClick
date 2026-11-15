import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ChipHorario from '../../components/ui/ChipHorario';
import { nombreCine } from '../../lib/formato';
import styles from './cartelera.module.css';

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

  const [[cine, delCine], ...otros] = agruparPorNombreDeCine(funciones);
  return (
    <div ref={zona} className={styles.horarios}>
      <p className={styles.horariosCine}>{nombreCine(cine)}</p>
      <ListaChips funciones={delCine} maximo={porFila} {...chip} />
      {otros.length > 0 && (
        <Link to={enlaceDetalle.to} state={enlaceDetalle.state} className={styles.masCines}>
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
          <ChipHorario funcion={funcion} elegida={funcion.id === elegidaId} onElegir={onElegir} conDetalle />
        </li>
      ))}
      {sobran && (
        <li>
          <Link
            to={enlaceDetalle.to}
            state={enlaceDetalle.state}
            className={styles.chipMas}
            aria-label={`Ver ${resto} ${resto === 1 ? 'horario' : 'horarios'} más`}
          >
            +{resto}
          </Link>
        </li>
      )}
    </ul>
  );
}

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
