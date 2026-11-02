import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { useToast } from '../../components/ui/useToast';
import { diaRelativo, horaCorta } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, nombreCine } from '../../lib/formato';
import { rutaLogin } from '../../lib/volver';
import { getFuncion } from '../../services/funciones';
import { IconoCerrar } from './iconos';
import PanelCombinables from './PanelCombinables';
import styles from './compra.module.css';

// Barra fija abajo que aparece al tocar un horario en la cartelera o en el detalle de la pelicula.
// El login se pide aca, antes de elegir las entradas. "Ver qué más podés ver ese día" despliega arriba de la
// barra las funciones que combinan (doble funcion); tocar una la elige en lugar de la actual (onCambiar).
export default function BarraFuncionElegida({ funcion, onQuitar, onCambiar }) {
  const { user, isAdmin } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const id = useId();
  // El panel queda abierto solo para la funcion en la que se abrio
  const [panelPara, setPanelPara] = useState(null);
  const panelAbierto = panelPara === funcion.id;

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

  const elegirOtra = async (sugerencia) => {
    try {
      onCambiar(await getFuncion(sugerencia.funcionId));
      setPanelPara(null);
    } catch {
      mostrarAviso('No pudimos elegir esa función. Probá de nuevo.', 'error');
    }
  };

  return (
    <>
      <div className={styles.espacioBarra} aria-hidden="true" />
      <div className={styles.barraFuncion} role="region" aria-label="Función elegida" data-barra-funcion>
        {panelAbierto && (
          <div id={`${id}-combinables`} className={styles.panelCombinables} role="region" aria-labelledby={`${id}-referencia`}>
            <PanelCombinables funcionId={funcion.id} onElegir={elegirOtra} idTitulo={`${id}-referencia`} />
          </div>
        )}
        <div className={styles.barraFuncionDatos} aria-live="polite">
          <strong className={styles.barraFuncionPelicula}>{funcion.peliculaTitulo}</strong>
          <span>
            {nombreCine(funcion.cineNombre)} · {diaRelativo(funcion.fechaHoraInicio)} · {horaCorta(funcion.fechaHoraInicio)} hs ·{' '}
            {etiquetaFormato(funcion.formato)} · {etiquetaIdioma(funcion.idioma)}
          </span>
          {onCambiar && (
            <button
              type="button"
              className={styles.verCombinables}
              aria-expanded={panelAbierto}
              aria-controls={`${id}-combinables`}
              onClick={() => setPanelPara(panelAbierto ? null : funcion.id)}
            >
              {panelAbierto ? 'Ocultar las otras funciones' : 'Ver qué más podés ver ese día'}
            </button>
          )}
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
