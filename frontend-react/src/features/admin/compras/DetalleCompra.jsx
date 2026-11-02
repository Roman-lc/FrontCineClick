import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import { SinDato } from '../../../components/admin/PaginaGestion';
import admin from '../../../components/admin/admin.module.css';
import EstadoError from '../../../components/ui/EstadoError';
import { EsqueletoFilas } from '../../../components/ui/Esqueletos';
import { fechaHoraBreve } from '../../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, formatearPrecio, nombreCine } from '../../../lib/formato';
import { NOMBRES_TIPO } from '../../cuenta/compras';
import { adminCompras } from '../../../services/admin';
import { ESTADOS_ARREPENTIMIENTO, ESTADOS_COMPRA, ESTADOS_ENTRADA, ESTADOS_PAGO, METODOS_PAGO, MOTIVOS_SOPORTE } from './estados';
import styles from './compras.module.css';

// Detalle de una compra para el panel: funcion, entradas, pago, promocion y, si existen, el arrepentimiento y las
// consultas de soporte. Solo lectura. Se monta con key={id}, asi cada compra arranca cargando.
export default function DetalleCompra({ id }) {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: false, detalle: null });

  useEffect(() => {
    let ignorar = false;
    adminCompras
      .detalle(id)
      .then((detalle) => !ignorar && setEstado({ cargando: false, error: false, detalle }))
      .catch((err) => !ignorar && setEstado({ cargando: false, error: err.status === 404 ? 'noExiste' : true, detalle: null }));
    return () => {
      ignorar = true;
    };
  }, [id, intento]);

  if (estado.cargando) return <EsqueletoFilas cantidad={6} alto={40} etiqueta="Cargando la compra" />;
  if (estado.error === 'noExiste') return <p className={styles.aviso}>No existe una compra con el número {id}.</p>;
  if (estado.error) {
    return (
      <EstadoError
        titulo="No pudimos cargar la compra"
        onReintentar={() => {
          setEstado({ cargando: true, error: false, detalle: null });
          setIntento((i) => i + 1);
        }}
      />
    );
  }

  const { compra, clienteEmail, promocion, arrepentimiento, consultas } = estado.detalle;
  const { funcion, pago } = compra;
  const est = ESTADOS_COMPRA[compra.estado] ?? { texto: compra.estado };
  const descuento = Number(compra.subtotal) - Number(compra.total);

  return (
    <div className={styles.detalle}>
      <section aria-labelledby="det-resumen">
        <h3 id="det-resumen" className="visually-hidden">
          Resumen
        </h3>
        <dl className={styles.datos}>
          <dt>Estado</dt>
          <dd>
            <BadgeEstado activo={est.activo} texto={est.texto} />
          </dd>
          <dt>Fecha de compra</dt>
          <dd>{fechaHoraBreve(compra.fechaCompra)}</dd>
          <dt>Cliente</dt>
          <dd>
            {compra.clienteNombre}
            <span className={admin.secundario}>{clienteEmail}</span>
          </dd>
        </dl>
      </section>

      <section aria-labelledby="det-funcion">
        <h3 id="det-funcion" className={styles.seccion}>
          Función
        </h3>
        <dl className={styles.datos}>
          <dt>Película</dt>
          <dd>{funcion.peliculaTitulo}</dd>
          <dt>Cine y sala</dt>
          <dd>
            {nombreCine(funcion.cineNombre)} · {funcion.salaNombre}
          </dd>
          <dt>Fecha y hora</dt>
          <dd>{fechaHoraBreve(funcion.fechaHoraInicio)}</dd>
          <dt>Formato</dt>
          <dd>
            {etiquetaFormato(funcion.formato)} · {etiquetaIdioma(funcion.idioma)}
          </dd>
        </dl>
      </section>

      <section aria-labelledby="det-entradas">
        <h3 id="det-entradas" className={styles.seccion}>
          Entradas ({compra.entradas.length})
        </h3>
        <div className={admin.tablaCaja}>
          <table className={admin.tabla}>
            <thead>
              <tr>
                <th scope="col">Butaca</th>
                <th scope="col">Código</th>
                <th scope="col">Tipo</th>
                <th scope="col">Precio</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {compra.entradas.map((e) => (
                <tr key={e.id}>
                  <td className={admin.nowrap}>{e.codigoButaca}</td>
                  <td className={admin.codigo}>{e.codigoQr}</td>
                  <td>{NOMBRES_TIPO[e.tipo] ?? e.tipo}</td>
                  <td className={admin.numero}>
                    {formatearPrecio(e.precioUnitario)}
                    {Number(e.descuento) > 0 && <span className={admin.secundario}>−{formatearPrecio(e.descuento)}</span>}
                  </td>
                  <td>{ESTADOS_ENTRADA[e.estado] ?? e.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="det-pago">
        <h3 id="det-pago" className={styles.seccion}>
          Pago
        </h3>
        <dl className={styles.datos}>
          <dt>Subtotal</dt>
          <dd>{formatearPrecio(compra.subtotal)}</dd>
          {descuento > 0 && (
            <>
              <dt>Descuento</dt>
              <dd>−{formatearPrecio(descuento)}</dd>
            </>
          )}
          <dt>Total</dt>
          <dd className={admin.principal}>{formatearPrecio(compra.total)}</dd>
          {pago ? (
            <>
              <dt>Estado del pago</dt>
              <dd>{ESTADOS_PAGO[pago.estado] ?? pago.estado}</dd>
              <dt>Medio</dt>
              <dd>
                {METODOS_PAGO[pago.metodoPago] ?? pago.metodoPago ?? <SinDato />}
                {pago.ultimos4 && <span className={admin.secundario}>{`${pago.marcaTarjeta ?? 'Tarjeta'} terminada en ${pago.ultimos4}`}</span>}
              </dd>
              <dt>Fecha</dt>
              <dd>{pago.fechaPago ? fechaHoraBreve(pago.fechaPago) : <SinDato />}</dd>
              <dt>Transacción</dt>
              <dd className={admin.codigo}>{pago.codigoTransaccion ?? <SinDato />}</dd>
            </>
          ) : (
            <>
              <dt>Estado del pago</dt>
              <dd>Sin pago registrado</dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby="det-promo">
        <h3 id="det-promo" className={styles.seccion}>
          Promoción
        </h3>
        {promocion ? (
          <dl className={styles.datos}>
            <dt>Código</dt>
            <dd className={admin.codigo}>{promocion.codigo}</dd>
            <dt>Beneficio</dt>
            <dd>
              {Number(promocion.porcentajeDescuento).toLocaleString('es-AR')}%{promocion.titulo ? ` · ${promocion.titulo}` : ''}
            </dd>
          </dl>
        ) : (
          <p className={styles.aviso}>No usó ninguna promoción.</p>
        )}
      </section>

      {arrepentimiento && (
        <section aria-labelledby="det-arrep">
          <h3 id="det-arrep" className={styles.seccion}>
            Arrepentimiento
          </h3>
          <dl className={styles.datos}>
            <dt>Solicitud</dt>
            <dd className={admin.codigo}>{arrepentimiento.codigo}</dd>
            <dt>Estado</dt>
            <dd>
              {ESTADOS_ARREPENTIMIENTO[arrepentimiento.estado] ?? arrepentimiento.estado}
              {arrepentimiento.motivoFueraDePlazo && <span className={admin.secundario}>{arrepentimiento.motivoFueraDePlazo}</span>}
            </dd>
            <dt>Fecha</dt>
            <dd>{fechaHoraBreve(arrepentimiento.fecha)}</dd>
            {arrepentimiento.montoReembolso != null && (
              <>
                <dt>Reembolso</dt>
                <dd>{formatearPrecio(arrepentimiento.montoReembolso)}</dd>
              </>
            )}
          </dl>
          <Link to="/admin/arrepentimientos" className={styles.enlace}>
            Ver en Arrepentimientos
          </Link>
        </section>
      )}

      {consultas.length > 0 && (
        <section aria-labelledby="det-soporte">
          <h3 id="det-soporte" className={styles.seccion}>
            Consultas de soporte ({consultas.length})
          </h3>
          <ul className={styles.consultas}>
            {consultas.map((c) => (
              <li key={c.id}>
                <span className={admin.codigo}>{c.numero}</span> · {MOTIVOS_SOPORTE[c.motivo] ?? c.motivo} ·{' '}
                {c.estado === 'RESUELTA' ? 'Resuelta' : 'Abierta'}
                <span className={admin.secundario}>{fechaHoraBreve(c.fecha)}</span>
                <p className={styles.mensaje}>{c.mensaje}</p>
              </li>
            ))}
          </ul>
          <Link to="/admin/soporte" className={styles.enlace}>
            Ver en Soporte
          </Link>
        </section>
      )}
    </div>
  );
}
