import { Link, useLocation } from 'react-router-dom';
import { formatearPrecio } from '../../lib/formato';
import { enviarArrepentimiento } from '../../services/solicitudes';
import FormularioSolicitud from './FormularioSolicitud';
import styles from './solicitud.module.css';

const CAMPOS = [
  { nombre: 'email', tipo: 'email', etiqueta: 'Email con el que compraste', vacio: 'Completá el email con el que compraste' },
  {
    nombre: 'codigo',
    tipo: 'codigo',
    etiqueta: 'Número de compra o código de entrada',
    ayuda: 'El número figura en la confirmación; el código de 8 caracteres está debajo del QR de cada entrada.',
    vacio: 'Completá el número de compra o el código de una entrada',
  },
  { nombre: 'nombre', tipo: 'texto', etiqueta: 'Nombre y apellido', autoComplete: 'name', vacio: 'Completá tu nombre y apellido' },
  {
    nombre: 'motivo',
    tipo: 'select',
    etiqueta: 'Motivo',
    opcional: true,
    opciones: [
      { valor: 'EQUIVOQUE_FUNCION', texto: 'Me equivoqué de función' },
      { valor: 'NO_PUEDO_ASISTIR', texto: 'No puedo asistir' },
      { valor: 'OTRO', texto: 'Otro' },
    ],
  },
  {
    nombre: 'confirma',
    tipo: 'casilla',
    etiqueta: 'Entiendo que se anulan todas las entradas de esta compra',
    vacio: 'Tenés que confirmar que se anulan todas las entradas de la compra',
  },
];

// Antes de enviar: si corresponde el arrepentimiento y, si no, por que (igual se puede enviar)
function Elegibilidad(compra) {
  if (compra.codigoArrepentimiento) {
    return (
      <div className={styles.aviso}>
        <p>
          Ya pediste el arrepentimiento de esta compra. Tu código es <strong>{compra.codigoArrepentimiento}</strong>; si lo enviás de
          nuevo, te mostramos el mismo.
        </p>
      </div>
    );
  }
  if (compra.elegibleArrepentimiento) {
    return (
      <div className={`${styles.aviso} ${styles.avisoOk}`}>
        <p data-icono="ok">
          <strong>Podés arrepentirte de esta compra.</strong>
        </p>
        <p>
          Se anulan {compra.cantidadEntradas === 1 ? 'la entrada' : `las ${compra.cantidadEntradas} entradas`} y te devolvemos{' '}
          {formatearPrecio(compra.total)} por el mismo medio de pago.
        </p>
      </div>
    );
  }
  return (
    <div className={`${styles.aviso} ${styles.avisoError}`}>
      <p data-icono="error">
        <strong>{compra.motivoNoElegible}.</strong>
      </p>
      <p>
        El plazo es de 10 días corridos desde la compra y hasta 60 minutos antes de la función. Igual podés enviar la solicitud:
        queda registrada como fuera de plazo y la revisamos a mano. Si preferís, escribinos desde <Link to="/soporte">Ayuda</Link>.
      </p>
    </div>
  );
}

function exito(solicitud) {
  const aprobada = solicitud.estado === 'APROBADA';
  return {
    titulo: aprobada ? 'Listo, anulamos tu compra' : 'Recibimos tu solicitud',
    numero: solicitud.codigo,
    mensaje: aprobada ? (
      <>
        <p>
          Las entradas de la compra N° {solicitud.compraId} quedaron anuladas y las butacas se liberaron. El reembolso de{' '}
          {formatearPrecio(solicitud.montoReembolso)} se acredita por el mismo medio de pago (en este proyecto el pago y el
          reembolso son simulados).
        </p>
        <p>Guardá este código: es el comprobante de tu arrepentimiento.</p>
      </>
    ) : solicitud.estado === 'RECHAZADA' ? (
      <p>La solicitud de esta compra ya fue revisada y no se aprobó. Si tenés dudas, escribinos desde Ayuda.</p>
    ) : (
      <>
        <p>
          Quedó registrada fuera de plazo{solicitud.motivoFueraDePlazo ? ` (${solicitud.motivoFueraDePlazo.toLowerCase()})` : ''}. La
          revisamos a mano y te respondemos por email.
        </p>
        <p>Guardá este código para cualquier consulta.</p>
      </>
    ),
    acciones: (
      <>
        <Link to="/" className="btn btn-primary">
          Volver a la cartelera
        </Link>
        <Link to="/soporte" className="btn">
          Ir a Ayuda
        </Link>
      </>
    ),
  };
}

// /arrepentimiento: publico, sin login ni registro (Resolucion 424/2020)
export default function ArrepentimientoPage() {
  const { state } = useLocation();
  const iniciales = {};
  if (state?.compraId) iniciales.codigo = String(state.compraId);
  if (state?.email) iniciales.email = state.email;

  return (
    <section className={`section ${styles.pagina}`}>
      <title>Botón de arrepentimiento | CineClick</title>
      <h1 className={styles.titulo}>Botón de arrepentimiento</h1>
      <p className={styles.bajada}>
        Podés revocar una compra dentro de los 10 días corridos desde que la hiciste y hasta 60 minutos antes de la función. Se
        anulan todas las entradas de la compra y te devolvemos el dinero por el mismo medio de pago. No necesitás iniciar sesión.
      </p>
      <FormularioSolicitud
        campos={CAMPOS}
        valoresIniciales={iniciales}
        requiereCompra
        detalleCompra={Elegibilidad}
        textoEnviar="Enviar solicitud de arrepentimiento"
        enviar={(valores) =>
          enviarArrepentimiento({
            email: valores.email,
            codigo: valores.codigo,
            nombre: valores.nombre,
            motivo: valores.motivo || null,
            confirmaAnulacion: valores.confirma,
          })
        }
        exito={exito}
      />
    </section>
  );
}
