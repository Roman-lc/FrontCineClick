import { fechaFuncionCorta } from '../../lib/fechas';
import { formatearPrecio, nombreCine } from '../../lib/formato';
import styles from './solicitud.module.css';

export default function TarjetaCompra({ compra }) {
  return (
    <p className={styles.tarjetaCompra}>
      <strong>{compra.peliculaTitulo}</strong> · {fechaFuncionCorta(compra.fechaHoraInicio)} · {nombreCine(compra.cineNombre)} ·{' '}
      {compra.cantidadEntradas} {compra.cantidadEntradas === 1 ? 'entrada' : 'entradas'} · {formatearPrecio(compra.total)}
      <span className={styles.numeroCompra}>Compra N° {compra.compraId}</span>
    </p>
  );
}
