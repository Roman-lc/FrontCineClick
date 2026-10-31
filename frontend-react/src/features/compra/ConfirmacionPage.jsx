import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import { getCompra } from '../../services/compras';
import { getFuncion } from '../../services/funciones';
import { diaRelativo, horaCorta } from '../../lib/fechas';
import { etiquetaFormato, formatearPrecio } from '../../lib/formato';
import styles from './compra.module.css';

const NOMBRES_TIPO = { GENERAL: 'General', MENOR: 'Menor', JUBILADO: 'Jubilado' };

export default function ConfirmacionPage() {
  const { compraId } = useParams();
  const { user } = useAuth();
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });

  useEffect(() => {
    let ignorar = false;
    getCompra(compraId)
      .then(async (compra) => {
        const funcion = await getFuncion(compra.funcionId);
        if (!ignorar) setEstado({ cargando: false, error: null, datos: { compra, funcion } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [compraId]);

  if (estado.cargando) {
    return (
      <section className="section">
        <Cargando texto="Cargando tu compra..." />
      </section>
    );
  }

  // La API no controla de quien es cada compra (limitacion conocida); al menos la interfaz no muestra las ajenas
  const ajena = estado.datos && estado.datos.compra.clienteId !== user.clienteId;
  if (estado.error?.status === 404 || ajena || (estado.datos && estado.datos.compra.estado !== 'CONFIRMADA')) {
    return (
      <section className="section">
        <EstadoVacio mensaje="No encontramos una compra confirmada con ese número.">
          <Link to="/" className="btn btn-primary">
            Volver a la cartelera
          </Link>
        </EstadoVacio>
      </section>
    );
  }
  if (estado.error) {
    return (
      <section className="section">
        <MensajeError mensaje={estado.error.message} />
      </section>
    );
  }

  const { compra, funcion } = estado.datos;
  return (
    <section className={`section ${styles.confirmacion}`}>
      <title>Compra confirmada | CineClick</title>
      <div className={styles.confirmacionCabecera}>
        <span className={styles.tilde} aria-hidden="true">
          ✓
        </span>
        <h1 className={styles.titulo}>¡Compra confirmada!</h1>
        <p className="texto-secundario">Compra N° {compra.id}</p>
      </div>

      <div className={styles.confirmacionFuncion}>
        <p className={styles.confirmacionPelicula}>{funcion.peliculaTitulo}</p>
        <p>
          {funcion.cineNombre} · {funcion.salaNombre}
        </p>
        <p>
          {diaRelativo(funcion.fechaHoraInicio)} · {horaCorta(funcion.fechaHoraInicio)} hs · {etiquetaFormato(funcion.formato)} ·{' '}
          {funcion.idioma}
        </p>
      </div>

      <h2 className={styles.bloqueTitulo}>Tus entradas</h2>
      <p className="texto-secundario">Presentá el código de cada entrada y tu DNI en el ingreso.</p>
      <ul className={styles.entradasConfirmadas}>
        {compra.entradas.map((entrada) => (
          <li key={entrada.id} className={styles.entradaConfirmada}>
            <div>
              <p className={styles.entradaButaca}>Butaca {entrada.codigoButaca}</p>
              <p className="texto-secundario">
                {NOMBRES_TIPO[entrada.tipo] ?? entrada.tipo} · {formatearPrecio(entrada.precioUnitario)}
              </p>
            </div>
            <p className={styles.codigoEntrada} aria-label={`Código de entrada ${entrada.codigoQr.split('').join(' ')}`}>
              {entrada.codigoQr}
            </p>
          </li>
        ))}
      </ul>

      <dl className={styles.desglose}>
        {compra.codigoPromocion && (
          <div className={styles.descuento}>
            <dt>Código aplicado</dt>
            <dd>{compra.codigoPromocion}</dd>
          </div>
        )}
        {compra.pago?.ultimos4 && (
          <div>
            <dt>Pagado con</dt>
            <dd>
              {compra.pago.marcaTarjeta} terminada en {compra.pago.ultimos4}
            </dd>
          </div>
        )}
        <div className={styles.desgloseTotal}>
          <dt>Total pagado</dt>
          <dd>{formatearPrecio(compra.total)}</dd>
        </div>
      </dl>

      <Link to="/" className="btn btn-primary">
        Volver a la cartelera
      </Link>
    </section>
  );
}
