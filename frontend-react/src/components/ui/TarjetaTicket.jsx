import styles from './TarjetaTicket.module.css';

export default function TarjetaTicket({ children, lateral, apilada = false, vertical = false, className = '' }) {
  return (
    <div className={`${styles.ticket} ${apilada ? styles.apilada : ''} ${vertical ? styles.vertical : ''} ${className}`}>
      <div className={styles.principal}>{children}</div>
      {lateral && <div className={styles.lateral}>{lateral}</div>}
    </div>
  );
}
