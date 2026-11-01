import styles from './TarjetaTicket.module.css';

/**
 * Tarjeta con forma de ticket: dos partes separadas por un borde perforado con muescas.
 * La usan los tipos de entrada del paso 1 de la compra y las promociones.
 *
 * Props:
 * - children: contenido principal (izquierda)
 * - lateral: contenido del talon (derecha), por ejemplo un contador o las acciones
 * - apilada: en pantallas angostas el talon pasa abajo y el perforado queda horizontal
 * - vertical: el talon va siempre abajo (para tarjetas angostas, como las de una grilla)
 * - className: clases extra para el contenedor
 */
export default function TarjetaTicket({ children, lateral, apilada = false, vertical = false, className = '' }) {
  return (
    <div className={`${styles.ticket} ${apilada ? styles.apilada : ''} ${vertical ? styles.vertical : ''} ${className}`}>
      <div className={styles.principal}>{children}</div>
      {lateral && <div className={styles.lateral}>{lateral}</div>}
    </div>
  );
}
