import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../app/AuthContext';
import BadgeCalificacion from '../../components/ui/BadgeCalificacion';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../../components/ui/Esqueletos';
import Poster from '../../components/ui/Poster';
import { getCompra } from '../../services/compras';
import { getFuncion } from '../../services/funciones';
import { fechaFuncionLarga, fechaHoraCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, formatearPrecio, nombreCine } from '../../lib/formato';
import { direccionCine, ubicacionCine, urlComoLlegar } from '../cines/cines';
import { NOMBRES_TIPO, REQUISITO_TIPO, descargarCalendario, estadoDeCompra, textoEntradas } from '../cuenta/compras';
import styles from './detalle.module.css';

const ESTADO_ENTRADA = { USADA: 'Usada', CANCELADA: 'Cancelada' };

// Excepcion a los tokens: el QR va siempre oscuro sobre claro, aunque la pagina sea oscura, porque
// muchos lectores no leen los QR invertidos. Son la tinta y el papel de la paleta "Afiche".
const QR_TINTA = '#14110d';
const QR_PAPEL = '#f3ede2';

// Confirmacion despues del pago y detalle de la compra desde Mis compras: es la misma pantalla.
// Viniendo del pago (state.desdePago) muestra "¡Compra confirmada!"; si no, el numero y el estado.
export default function ConfirmacionPage() {
  const { compraId } = useParams();
  const { state } = useLocation();
  const desdePago = Boolean(state?.desdePago);
  const { user } = useAuth();
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, compra: null });

  useEffect(() => {
    let ignorar = false;
    getCompra(compraId)
      .then(async (compra) => {
        // Un backend sin el resumen de la funcion en la compra: se completa con la funcion
        const funcion = compra.funcion ?? (await getFuncion(compra.funcionId));
        if (!ignorar) setEstado({ cargando: false, error: null, compra: { ...compra, funcion } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, compra: null });
      });
    return () => {
      ignorar = true;
    };
  }, [compraId, intento]);

  if (estado.cargando) {
    return (
      <section className="section">
        <EsqueletoFilas cantidad={3} alto={140} etiqueta="Cargando tu compra" />
      </section>
    );
  }

  const { compra } = estado;
  // La API no controla de quien es cada compra (limitacion conocida); al menos la interfaz no muestra las ajenas
  const ajena = compra && compra.clienteId !== user.clienteId;
  const situacion = compra && estadoDeCompra(compra);
  if (estado.error?.status === 404 || ajena || (compra && !situacion)) {
    return (
      <section className="section">
        <EstadoVacio titulo="No encontramos esa compra" mensaje="Revisá tus compras o volvé a la cartelera.">
          <Link to="/mis-compras" className="btn btn-primary">
            Ver mis compras
          </Link>
          <Link to="/" className="btn">
            Ver la cartelera
          </Link>
        </EstadoVacio>
      </section>
    );
  }
  if (estado.error) {
    return (
      <section className="section">
        <EstadoError
          titulo="No pudimos cargar tu compra"
          onReintentar={() => {
            setEstado({ cargando: true, error: null, compra: null });
            setIntento((n) => n + 1);
          }}
        />
      </section>
    );
  }

  const { funcion } = compra;
  const cancelada = situacion.clave === 'cancelada';
  const tieneDireccion = Boolean(funcion.calle);
  const direccion = tieneDireccion ? `${direccionCine(funcion)}, ${ubicacionCine(funcion)}` : '';
  const descuento = Number(compra.subtotal) - Number(compra.total);

  return (
    <section className={`section ${styles.detalle}`}>
      <title>{desdePago ? 'Compra confirmada | CineClick' : `Compra N° ${compra.id} | CineClick`}</title>

      {!desdePago && (
        <Link to="/mis-compras" className={styles.volver}>
          ‹ Mis compras
        </Link>
      )}

      <div className={styles.cabecera}>
        {desdePago ? (
          <>
            <span className={styles.tilde} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <div>
              <h1 className={styles.titulo}>¡Compra confirmada!</h1>
              <p className={styles.bajada}>Compra N° {compra.id}. Te esperamos en la sala.</p>
            </div>
          </>
        ) : (
          <div className={styles.tituloEstado}>
            <h1 className={styles.titulo}>Compra N° {compra.id}</h1>
            <span className={`${styles.estado} ${styles[situacion.clave]}`}>{situacion.texto}</span>
          </div>
        )}
      </div>

      <div className={styles.funcion}>
        <Poster pelicula={{ titulo: funcion.peliculaTitulo, urlPoster: funcion.urlPoster }} className={styles.poster} cargaDiferida={false} />
        <div className={styles.funcionDatos}>
          <p className={styles.pelicula}>
            {funcion.peliculaTitulo} {funcion.clasificacion && <BadgeCalificacion clasificacion={funcion.clasificacion} />}
          </p>
          <p className={styles.fecha}>{fechaFuncionLarga(funcion.fechaHoraInicio)}</p>
          <p>
            {etiquetaFormato(funcion.formato)} · {etiquetaIdioma(funcion.idioma)}
          </p>
          <p>
            {nombreCine(funcion.cineNombre)} · {funcion.salaNombre}
          </p>
          {tieneDireccion && (
            <p className={styles.direccion}>
              {direccion}{' '}
              <a href={urlComoLlegar(funcion)} target="_blank" rel="noopener noreferrer" className={styles.comoLlegar}>
                Cómo llegar ›<span className="visually-hidden"> (se abre en otra pestaña)</span>
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Lo que se imprime: solo las entradas, con los datos de la funcion en cada hoja */}
      <section className={styles.entradasBloque} aria-labelledby="titulo-entradas">
        <h2 id="titulo-entradas" className={styles.subtitulo}>
          Tus entradas
        </h2>
        {!cancelada && <p className={styles.ayuda}>Mostrá el código QR de cada entrada en el ingreso. {textoEntradas(compra.entradas)}.</p>}
        <div className={styles.soloImpresion}>
          <p className={styles.impresionPelicula}>{funcion.peliculaTitulo}</p>
          <p>
            {fechaFuncionLarga(funcion.fechaHoraInicio)} · {funcion.cineNombre} · {funcion.salaNombre}
          </p>
          {direccion && <p>{direccion}</p>}
          <p>Compra N° {compra.id}</p>
        </div>
        <ul className={styles.entradas}>
          {compra.entradas.map((entrada) => {
            const estadoEntrada = ESTADO_ENTRADA[entrada.estado];
            return (
              <li key={entrada.id} className={`${styles.entrada} ${estadoEntrada ? styles.entradaApagada : ''}`}>
                <div className={styles.qr}>
                  {/* Recuadro claro con ~12px de zona de silencio alrededor del QR */}
                  <span className={styles.qrFondo} style={{ background: QR_PAPEL }}>
                    <QRCodeSVG value={entrada.codigoQr} size={104} level="M" marginSize={0} fgColor={QR_TINTA} bgColor={QR_PAPEL} title={`Código QR de la butaca ${entrada.codigoButaca}`} />
                  </span>
                  <span className={styles.codigo} aria-label={`Código ${entrada.codigoQr.split('').join(' ')}`}>
                    {entrada.codigoQr}
                  </span>
                </div>
                <div className={styles.entradaDatos}>
                  <p className={styles.butaca}>Butaca {entrada.codigoButaca}</p>
                  <p>
                    {NOMBRES_TIPO[entrada.tipo] ?? entrada.tipo} · {formatearPrecio(entrada.precioUnitario)}
                  </p>
                  {REQUISITO_TIPO[entrada.tipo] && <p className={styles.requisito}>{REQUISITO_TIPO[entrada.tipo]}</p>}
                  {!desdePago && (
                    <p className={styles.estadoEntrada}>{estadoEntrada ? estadoEntrada : 'Sin usar'}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <dl className={styles.desglose}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatearPrecio(compra.subtotal)}</dd>
        </div>
        {compra.codigoPromocion && descuento > 0 && (
          <div className={styles.descuento}>
            <dt>Descuento ({compra.codigoPromocion})</dt>
            <dd>−{formatearPrecio(descuento)}</dd>
          </div>
        )}
        <div className={styles.total}>
          <dt>{cancelada ? 'Total' : 'Total pagado'}</dt>
          <dd>{cancelada ? 'Sin cargo' : formatearPrecio(compra.total)}</dd>
        </div>
        {compra.pago?.ultimos4 && !cancelada && (
          <div className={styles.secundario}>
            <dt>Medio de pago</dt>
            <dd>
              {compra.pago.marcaTarjeta} terminada en {compra.pago.ultimos4}
            </dd>
          </div>
        )}
        <div className={styles.secundario}>
          <dt>Fecha de la compra</dt>
          <dd>{fechaHoraCorta(compra.fechaCompra)}</dd>
        </div>
      </dl>

      <div className={styles.acciones}>
        <Link to="/mis-compras" className="btn">
          Ver en Mis compras
        </Link>
        {!cancelada && (
          <>
            <button type="button" className="btn" onClick={() => window.print()}>
              Imprimir entradas
            </button>
            {situacion.clave === 'proxima' && (
              <button type="button" className="btn btn-primary" onClick={() => descargarCalendario({ compra, funcion, direccion })}>
                Agregar al calendario
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
