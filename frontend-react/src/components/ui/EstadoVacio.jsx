import styles from './estados.module.css';

/**
 * Estado vacio: explica por que no hay nada y ofrece una salida (nunca un callejon sin salida).
 *
 * Props:
 * - titulo: frase principal opcional ("Todavía no tenés compras")
 * - mensaje: explicacion o sugerencia ("Probá con mañana")
 * - children: las acciones (botones o enlaces), por ejemplo "Ver la cartelera"
 */
export default function EstadoVacio({ titulo, mensaje, children }) {
  return (
    <div className={styles.estado}>
      {titulo && <p className={styles.titulo}>{titulo}</p>}
      {mensaje && <p>{mensaje}</p>}
      {children && <div className={styles.acciones}>{children}</div>}
    </div>
  );
}
