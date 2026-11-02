import { fechaFuncionCorta } from '../../lib/fechas';
import { formatearPrecio, nombreCine } from '../../lib/formato';
import styles from './solicitud.module.css';

// Resumen de la compra encontrada, para que el usuario confirme que es la correcta antes de enviar
export default function TarjetaCompra({ compra }) {
  return (
    <p className={styles.tarjetaCompra}>
      <strong>{compra.peliculaTitulo}</strong> · {fechaFuncionCorta(compra.fechaHoraInicio)} · {nombreCine(compra.cineNombre)} ·{' '}
      {compra.cantidadEntradas} {compra.cantidadEntradas === 1 ? 'entrada' : 'entradas'} · {formatearPrecio(compra.total)}
      <span className={styles.numeroCompra}>Compra N° {compra.compraId}</span>
    </p>
  );
}
