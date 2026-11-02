import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import Modal from '../../components/ui/Modal';
import { aplicarPromocion, getCompra, pagarCompra } from '../../services/compras';
import { formatearPrecio } from '../../lib/formato';
import { borrarPromoGuardada, leerPromoGuardada } from '../../lib/promoGuardada';
import {
  detectarMarca,
  validarCodigoSeguridad,
  validarDni,
  validarNumeroTarjeta,
  validarTitular,
  validarVencimiento,
} from '../../lib/tarjeta';
import { etiquetaClasificacion } from '../../lib/formato';
import { IDS_CAMPOS, borrarCompra, edadMinima, nuevaReserva, textoDeclaracionMenores } from './estadoCompra';
import FormularioTarjeta from './FormularioTarjeta';
import { METODOS_PAGO } from './metodosPago';
import PasoCompra from './PasoCompra';
import TerminosYCondiciones from '../institucional/TerminosYCondiciones';
import { InformacionCompra } from './TextosCompra';
import { useCompra } from './useCompra';
import styles from './compra.module.css';

const IDS = { ...IDS_CAMPOS, terminos: 'acepta-terminos', menores: 'acepta-menores' };
// Orden en que se busca el primer error al tocar "Pagar". Sin cargo (total en $ 0) no se pide tarjeta.
const CAMPOS = ['numero', 'vencimiento', 'codigo', 'titular', 'dni', 'terminos', 'menores'];
const CAMPOS_SIN_CARGO = ['terminos', 'menores'];

export default function PasoPago() {
  const { funcion, estado } = useCompra();
  if (!estado.reserva) return <Navigate to={`/compra/${funcion.id}/butacas`} replace />;
  return <FormularioPago />;
}

function FormularioPago() {
  const { funcion, pelicula, estado, actualizar, segundosRestantes } = useCompra();
  const { user } = useAuth();
  const navigate = useNavigate();
  const compra = estado.reserva.compra;

  const [metodo, setMetodo] = useState(METODOS_PAGO[0]);
  const [valores, setValores] = useState({
    numero: '',
    vencimiento: '',
    codigo: '',
    titular: '',
    dni: '',
    terminos: false,
    menores: false,
    novedades: false,
  });
  const [visibles, setVisibles] = useState(() => new Set());
  const [verTerminos, setVerTerminos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [reservaPerdida, setReservaPerdida] = useState(false);
  const idCompra = useRef(compra.id);

  // Al entrar (o recargar) se pide la reserva al backend para tener el tiempo restante real
  useEffect(() => {
    let ignorar = false;
    getCompra(idCompra.current)
      .then((actual) => {
        if (ignorar) return;
        if (actual.estado === 'CONFIRMADA') {
          borrarCompra();
          navigate(`/compra/confirmacion/${actual.id}`, { replace: true, state: { desdePago: true } });
        } else if (actual.estado !== 'PENDIENTE_PAGO' || !actual.segundosRestantes) {
          setReservaPerdida(true);
        } else {
          actualizar({ reserva: nuevaReserva(actual) });
        }
      })
      .catch(() => {
        if (!ignorar) setReservaPerdida(true);
      });
    return () => {
      ignorar = true;
    };
  }, [navigate, actualizar]);

  const sinCargo = Number(compra.total) === 0;
  const campos = sinCargo ? CAMPOS_SIN_CARGO : CAMPOS;
  const marca = detectarMarca(valores.numero);
  const edad = edadMinima(pelicula.clasificacion);
  const pideDeclaracion = edad >= 13;
  const errores = {
    numero: validarNumeroTarjeta(valores.numero),
    vencimiento: validarVencimiento(valores.vencimiento),
    codigo: validarCodigoSeguridad(valores.codigo, marca),
    titular: validarTitular(valores.titular),
    dni: validarDni(valores.dni),
    terminos: valores.terminos ? '' : 'Tenés que aceptar los términos y condiciones para continuar.',
    menores: !pideDeclaracion || valores.menores ? '' : 'Tenés que confirmar esta declaración para continuar.',
  };
  // Un error se muestra recien al salir del campo (o al tocar Pagar), no mientras se escribe
  const erroresVisibles = Object.fromEntries(CAMPOS.map((c) => [c, visibles.has(c) ? errores[c] : '']));

  const cambiar = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setVisibles((v) => {
      const nuevo = new Set(v);
      nuevo.delete(campo);
      return nuevo;
    });
  };
  const salir = (campo) => setVisibles((v) => new Set(v).add(campo));

  const vencida = reservaPerdida || (segundosRestantes === 0 && !procesando);

  const pagar = async () => {
    setVisibles(new Set(campos));
    const primero = campos.find((c) => errores[c]);
    if (primero) {
      document.getElementById(IDS[primero])?.focus();
      return;
    }
    setProcesando(true);
    setErrorPago('');
    try {
      const pago = await pagarCompra(
        compra.id,
        sinCargo
          ? { metodoPago: null, marca: null, ultimos4: null, aceptaTerminos: valores.terminos }
          : {
              metodoPago: metodo.metodoPago,
              marca: marca.nombre,
              ultimos4: valores.numero.slice(-4),
              aceptaTerminos: valores.terminos,
            },
      );
      if (pago.estado === 'APROBADO') {
        borrarCompra();
        navigate(`/compra/confirmacion/${compra.id}`, { replace: true, state: { desdePago: true } });
        return;
      }
      setErrorPago('El pago fue rechazado. Revisá los datos de la tarjeta o probá con otra. Tu reserva sigue activa.');
    } catch (err) {
      if (err.status === 400 && compra.codigoPromocion) {
        // La promocion dejo de valer entre el resumen y el pago: el backend la quito y recalculo el total, y la
        // reserva sigue activa. Se muestra el total nuevo para que el cliente decida si paga sin descuento.
        const actual = await getCompra(compra.id).catch(() => null);
        if (actual) actualizar({ reserva: nuevaReserva(actual) });
        setErrorPago(
          `${err.message}. Quitamos el código ${compra.codigoPromocion}${actual ? ` y el total ahora es ${formatearPrecio(actual.total)}` : ''}. Si estás de acuerdo, podés pagar sin descuento.`,
        );
      } else if (err.status === 409) {
        // Puede ser que la reserva haya vencido o que un intento anterior ya se haya aprobado
        const actual = await getCompra(compra.id).catch(() => null);
        if (actual?.estado === 'CONFIRMADA') {
          borrarCompra();
          navigate(`/compra/confirmacion/${compra.id}`, { replace: true, state: { desdePago: true } });
          return;
        }
        setReservaPerdida(true);
      } else {
        setErrorPago('No pudimos procesar el pago. Probá de nuevo en unos segundos; tu reserva sigue activa.');
      }
    }
    setProcesando(false);
  };

  return (
    <PasoCompra
      titulo="Pago"
      paso={3}
      onAtras={() => navigate(`/compra/${funcion.id}/butacas`)}
      accion={{ texto: sinCargo ? 'Confirmar' : 'Pagar', onClick: pagar, cargando: procesando, deshabilitado: vencida }}
      extraResumen={
        <DetallePago
          compra={compra}
          deshabilitado={vencida || procesando}
          onAplicar={async (codigo) => {
            const actualizada = await aplicarPromocion(compra.id, codigo);
            actualizar({ reserva: nuevaReserva(actualizada) });
          }}
        />
      }
    >
      {vencida ? (
        <div className={styles.vencida} role="alert">
          <p className={styles.vencidaTitulo} data-icono="error">
            Se terminó el tiempo de tu reserva
          </p>
          <p>Las butacas se liberaron. Podés volver a elegirlas si siguen disponibles.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/compra/${funcion.id}/butacas`)}>
            Elegir butacas de nuevo
          </button>
        </div>
      ) : (
        <>
          {sinCargo && (
            <section className={styles.bloque} aria-labelledby="titulo-sin-cargo">
              <h3 id="titulo-sin-cargo" className={styles.bloqueTitulo} data-icono="ok">
                Esta compra no tiene cargo
              </h3>
              <p className={styles.indicacion}>
                El descuento cubre el total: no hace falta ingresar una tarjeta. Aceptá los términos y confirmá.
              </p>
            </section>
          )}

          {!sinCargo && (
            <fieldset className={styles.bloque}>
              <legend className={styles.bloqueTitulo}>Método de pago</legend>
              <div className={styles.metodos}>
                {METODOS_PAGO.map((m) => (
                  <label key={m.id} className={styles.metodo}>
                    <input
                      type="radio"
                      name="metodo-pago"
                      className="visually-hidden"
                      checked={metodo.id === m.id}
                      onChange={() => setMetodo(m)}
                    />
                    <m.Icono />
                    <span className={styles.metodoTexto}>
                      <strong>{m.nombre}</strong>
                      <span>{m.descripcion}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <section className={styles.bloque} aria-labelledby="titulo-datos">
            <h3 id="titulo-datos" className={styles.bloqueTitulo}>
              Tus datos
            </h3>
            <div className={styles.camposTarjeta}>
              <DatoFijo id="dato-nombre" etiqueta="Nombre" valor={user.nombre} />
              <DatoFijo id="dato-apellido" etiqueta="Apellido" valor={user.apellido} />
              <DatoFijo id="dato-email" etiqueta="Email" valor={user.email} completo />
            </div>
          </section>

          {!sinCargo && metodo.id === 'tarjeta' && (
            <section className={styles.bloque} aria-labelledby="titulo-tarjeta">
              <h3 id="titulo-tarjeta" className={styles.bloqueTitulo}>
                Datos de la tarjeta
              </h3>
              <FormularioTarjeta
                valores={valores}
                errores={erroresVisibles}
                marca={marca}
                onCambiar={cambiar}
                onSalir={salir}
              />
            </section>
          )}

          <section className={styles.bloque} aria-labelledby="titulo-terminos">
            <h3 id="titulo-terminos" className={styles.bloqueTitulo}>
              Términos y condiciones
            </h3>
            <Casilla
              id={IDS.terminos}
              marcada={valores.terminos}
              error={erroresVisibles.terminos}
              onCambiar={(v) => cambiar('terminos', v)}
            >
              Leí y acepto los{' '}
              <button type="button" className={styles.enlace} onClick={() => setVerTerminos(true)}>
                términos y condiciones
              </button>
            </Casilla>
            {pideDeclaracion && (
              <Casilla
                id={IDS.menores}
                marcada={valores.menores}
                error={erroresVisibles.menores}
                onCambiar={(v) => cambiar('menores', v)}
              >
                {textoDeclaracionMenores(edad)} (película {etiquetaClasificacion(pelicula.clasificacion)})
              </Casilla>
            )}
            <Casilla id="acepta-novedades" marcada={valores.novedades} onCambiar={(v) => cambiar('novedades', v)}>
              Quiero recibir novedades de estrenos y promociones
            </Casilla>
          </section>

          <section className={styles.bloque} aria-labelledby="titulo-info">
            <h3 id="titulo-info" className={styles.bloqueTitulo}>
              Información de tu compra
            </h3>
            <div className={styles.info}>
              <InformacionCompra />
            </div>
          </section>

          {errorPago && (
            <p className={styles.alerta} role="alert" data-icono="error">
              {errorPago}
            </p>
          )}
        </>
      )}

      <Modal abierto={verTerminos} titulo="Términos y condiciones" onCerrar={() => setVerTerminos(false)}>
        <TerminosYCondiciones />
      </Modal>
    </PasoCompra>
  );
}

function DatoFijo({ id, etiqueta, valor, completo = false }) {
  return (
    <div className={`${styles.campo} ${completo ? styles.campoCompleto : ''}`}>
      <label htmlFor={id} className={styles.etiquetaCampo}>
        {etiqueta}
      </label>
      <input id={id} className="form-input" value={valor || ''} readOnly />
    </div>
  );
}

function Casilla({ id, marcada, error, onCambiar, children }) {
  return (
    <div className={styles.casilla}>
      <input
        id={id}
        type="checkbox"
        checked={marcada}
        onChange={(e) => onCambiar(e.target.checked)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <label htmlFor={id}>{children}</label>
      {error && (
        <p id={`${id}-error`} className={styles.errorCampo} data-icono="error">
          {error}
        </p>
      )}
    </div>
  );
}

// Va en el resumen: codigo promocional arriba del total y el desglose que devolvio el backend
function DetallePago({ compra, deshabilitado, onAplicar }) {
  const [codigo, setCodigo] = useState('');
  const [aplicando, setAplicando] = useState(false);
  const [error, setError] = useState('');
  const subtotal = Number(compra.subtotal ?? compra.total);
  const total = Number(compra.total);
  const descuento = subtotal - total;
  const entradas = compra.entradas ?? [];
  const conDescuento = entradas.filter((e) => Number(e.descuento) > 0);

  const aplicarCodigo = useCallback(
    async (valor, desdePromociones = false) => {
      setAplicando(true);
      setError('');
      try {
        await onAplicar(valor);
        setCodigo('');
        if (desdePromociones) borrarPromoGuardada();
      } catch (err) {
        setError(motivoRechazo(err));
        // Si el codigo elegido en Promociones no sirve, se descarta para que no vuelva a intentarse
        if (desdePromociones) borrarPromoGuardada();
      }
      setAplicando(false);
    },
    [onAplicar],
  );

  // Codigo elegido con "Usar en mi compra": se precarga y se aplica solo al llegar al pago
  const promoIntentada = useRef(false);
  useEffect(() => {
    const guardada = leerPromoGuardada();
    if (promoIntentada.current || !guardada || compra.codigoPromocion || deshabilitado) return;
    promoIntentada.current = true;
    setCodigo(guardada);
    aplicarCodigo(guardada, true);
  }, [compra.codigoPromocion, deshabilitado, aplicarCodigo]);

  const aplicar = (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setError('Ingresá un código.');
      return;
    }
    aplicarCodigo(codigo.trim());
  };

  return (
    <div className={styles.detallePago}>
      {compra.codigoPromocion ? (
        <div>
          <p className={styles.promoAplicada} data-icono="ok">
            Código {compra.codigoPromocion} aplicado
          </p>
          {conDescuento.length > 0 && conDescuento.length < entradas.length && (
            <p className={styles.indicacion}>
              Se aplica a {conDescuento.length} de {entradas.length} entradas (las de mayor precio):{' '}
              {conDescuento.map((e) => `${e.codigoButaca} −${formatearPrecio(e.descuento)}`).join(', ')}.
            </p>
          )}
        </div>
      ) : (
        <form className={styles.promo} onSubmit={aplicar} noValidate>
          <label htmlFor="codigo-promocional" className={styles.etiquetaCampo}>
            Código promocional
          </label>
          <div className={styles.promoFila}>
            <input
              id="codigo-promocional"
              className="form-input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              disabled={deshabilitado}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'codigo-promocional-error' : undefined}
            />
            <button type="submit" className="btn btn-sm" disabled={deshabilitado || aplicando}>
              {aplicando ? 'Aplicando…' : 'Aplicar'}
            </button>
          </div>
          {error && (
            <p id="codigo-promocional-error" className={styles.errorCampo} role="alert" data-icono="error">
              {error}
            </p>
          )}
        </form>
      )}

      <dl className={styles.desglose}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatearPrecio(subtotal)}</dd>
        </div>
        {descuento > 0 && (
          <div className={styles.descuento}>
            <dt>Descuento{compra.codigoPromocion ? ` (${compra.codigoPromocion})` : ''}</dt>
            <dd>− {formatearPrecio(descuento)}</dd>
          </div>
        )}
        <div className={styles.desgloseTotal}>
          <dt>Total</dt>
          <dd>{formatearPrecio(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

// Motivo en lenguaje claro. Las reglas de las promociones ya vuelven del backend con su mensaje para el
// usuario ("Esta promoción vale los lunes...", "Ya usaste esta promoción"...).
function motivoRechazo(err) {
  if (err.status === 404) return 'Ese código no existe.';
  if (err.status === 400) return err.message.endsWith('.') ? err.message : `${err.message}.`;
  if (err.status === 409) return 'La reserva venció: elegí las butacas de nuevo para usar el código.';
  return 'No pudimos aplicar el código. Probá de nuevo.';
}
