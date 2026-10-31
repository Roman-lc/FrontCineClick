import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastProvider';
import { cancelarCompra } from '../../services/compras';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { borrarCompra, formatearReloj } from './estadoCompra';
import { IconoAtras, IconoCerrar } from './iconos';
import ResumenCompra from './ResumenCompra';
import { useCompra } from './useCompra';
import styles from './compra.module.css';

// Estructura comun de los tres pasos: cabecera (atras, titulo con el reloj, cerrar), contenido a la
// izquierda y resumen a la derecha. accion: { texto, onClick, deshabilitado, cargando }.
// extraResumen va al final del resumen en desktop y al final del contenido en mobile.
export default function PasoCompra({ titulo, paso, onAtras, accion, extraResumen, children }) {
  const { funcion, estado, segundosRestantes } = useCompra();
  const navigate = useNavigate();
  const { confirmar } = useToast();
  const esMovil = useMediaQuery('(max-width: 860px)');
  const conReloj = Boolean(estado.reserva) && segundosRestantes !== null;

  const cerrar = async () => {
    if (estado.reserva) {
      const salir = await confirmar(
        'Si salís ahora se cancela tu reserva y las butacas quedan libres para otras personas.',
        { textoOk: 'Salir y cancelar', textoCancelar: 'Seguir comprando', peligro: true }
      );
      if (!salir) return;
      cancelarCompra(estado.reserva.compra.id).catch(() => {});
    }
    borrarCompra();
    navigate(`/peliculas/${funcion.peliculaId}`);
  };

  return (
    <section className={`section ${styles.compra}`}>
      <title>{`${titulo} | CineClick`}</title>
      <header className={styles.cabecera}>
        <button type="button" className={styles.botonIcono} onClick={onAtras} aria-label="Volver al paso anterior">
          <IconoAtras />
        </button>
        <h1 className={styles.titulo}>
          {titulo}
          {conReloj && (
            <span className={styles.reloj} aria-hidden="true">
              {' · '}
              {formatearReloj(segundosRestantes)}
            </span>
          )}
        </h1>
        <button type="button" className={styles.botonIcono} onClick={cerrar} aria-label="Cerrar la compra">
          <IconoCerrar />
        </button>
      </header>
      {conReloj && <AvisoTiempo segundos={segundosRestantes} />}

      <div className={styles.columnas}>
        <div className={styles.contenido}>
          {children}
          {esMovil && extraResumen}
        </div>
        <ResumenCompra paso={paso} accion={accion} esMovil={esMovil} extra={esMovil ? null : extraResumen} />
      </div>
    </section>
  );
}

// Para lectores de pantalla: el reloj del titulo cambia cada segundo y no se anuncia
function AvisoTiempo({ segundos }) {
  let texto = `Tu reserva vence en ${Math.ceil(segundos / 60)} minutos.`;
  if (segundos <= 60) texto = 'Queda menos de un minuto para completar la compra.';
  if (segundos === 0) texto = 'Se terminó el tiempo de la reserva.';
  return (
    <p className="visually-hidden" aria-live="polite">
      {texto}
    </p>
  );
}
