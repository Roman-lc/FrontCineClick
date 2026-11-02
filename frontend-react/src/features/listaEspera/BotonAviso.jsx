import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { useToast } from '../../components/ui/useToast';
import { anotarEnListaEspera, quitarDeListaEspera } from '../../services/listaEspera';
import { rutaPelicula } from '../../lib/slug';
import { rutaLogin } from '../../lib/volver';
import styles from './BotonAviso.module.css';

// "Avisarme" para un proximo estreno sin entradas a la venta. Sin sesion lleva al login y vuelve al
// detalle de la pelicula. Las cuentas de administrador no lo ven.
export default function BotonAviso({ pelicula, anotada, onCambio, className = '' }) {
  const { user, isAdmin } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  if (isAdmin) return null;

  const alternar = async () => {
    if (!user?.clienteId) {
      navigate(rutaLogin(rutaPelicula(pelicula.titulo)));
      return;
    }
    setEnviando(true);
    try {
      if (anotada) {
        await quitarDeListaEspera(pelicula.id, user.clienteId);
        onCambio(pelicula.id, false);
        mostrarAviso(`Listo, te quitamos de la lista de espera de ${pelicula.titulo}`, 'info');
      } else {
        await anotarEnListaEspera(pelicula.id, user.clienteId);
        onCambio(pelicula.id, true);
        mostrarAviso(`Te anotamos: te avisamos cuando salgan las entradas de ${pelicula.titulo}`, 'exito');
      }
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
    setEnviando(false);
  };

  return (
    <button
      type="button"
      className={`btn btn-sm ${styles.boton} ${anotada ? styles.anotada : ''} ${className}`}
      aria-pressed={anotada}
      aria-label={`Avisarme cuando salgan las entradas de ${pelicula.titulo}`}
      onClick={alternar}
      disabled={enviando}
    >
      {anotada ? <IconoListo /> : <IconoCampana />}
      {anotada ? 'Te avisamos' : 'Avisarme'}
    </button>
  );
}

const icono = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

function IconoCampana() {
  return (
    <svg {...icono}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IconoListo() {
  return (
    <svg {...icono}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
