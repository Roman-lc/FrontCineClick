import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { diaRelativo, horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, nombreCine } from '../../lib/formato';
import { rutaLogin } from '../../lib/volver';
import { IconoCerrar } from './iconos';
import styles from './compra.module.css';

// Barra fija abajo que aparece al tocar un horario en la cartelera o en el detalle de la pelicula.
// El login se pide aca, antes de elegir las entradas.
export default function BarraFuncionElegida({ funcion, onQuitar }) {
  const { user, isAdmin } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();

  const comprar = () => {
    const destino = `/compra/${funcion.id}/entradas`;
    if (isAdmin) {
      mostrarAviso('Las cuentas de administrador no pueden comprar entradas', 'error');
    } else if (!user?.clienteId) {
      navigate(rutaLogin(destino));
    } else {
      navigate(destino);
    }
  };

  return (
    <>
      <div className={styles.espacioBarra} aria-hidden="true" />
      <div className={styles.barraFuncion} role="region" aria-label="Función elegida" aria-live="polite">
        <div className={styles.barraFuncionDatos}>
          <strong className={styles.barraFuncionPelicula}>{funcion.peliculaTitulo}</strong>
          <span>
            {nombreCine(funcion.cineNombre)} · {diaRelativo(funcion.fechaHoraInicio)} · {horaCorta(funcion.fechaHoraInicio)} hs ·{' '}
            {etiquetaFormato(funcion.formato)} · {etiquetaIdioma(funcion.idioma)}
          </span>
        </div>
        <div className={styles.barraFuncionAcciones}>
          <button type="button" className={styles.botonIcono} onClick={onQuitar} aria-label="Quitar la función elegida">
            <IconoCerrar tamano={18} />
          </button>
          <button type="button" className="btn btn-primary" onClick={comprar}>
            Comprar entradas
          </button>
        </div>
      </div>
    </>
  );
}
