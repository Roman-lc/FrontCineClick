import { useState } from 'react';
import { cambiarComunicaciones } from '../../services/cuenta';
import { useToast } from '../../components/ui/useToast';
import BloqueCuenta from './BloqueCuenta';
import styles from './miCuenta.module.css';

export default function SeccionComunicaciones({ cuenta, onActualizar }) {
  const { mostrarAviso } = useToast();
  const [guardando, setGuardando] = useState(false);

  const alternar = async (valor) => {
    setGuardando(true);
    try {
      onActualizar(await cambiarComunicaciones(valor));
      mostrarAviso(valor ? 'Vas a recibir novedades de estrenos y promociones' : 'Ya no vas a recibir novedades', 'exito');
    } catch (err) {
      mostrarAviso(err.message || 'No se pudo guardar la preferencia.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <BloqueCuenta id="comunicaciones" titulo="Comunicaciones" sinEditar>
      <label className={styles.interruptor} htmlFor="cuenta-novedades">
        <span>
          <span className={styles.interruptorTexto}>Recibir novedades de estrenos y promociones</span>
          <span className="form-ayuda">Te escribimos al email de tu cuenta. Podés dejar de recibirlas cuando quieras.</span>
        </span>
        <input
          id="cuenta-novedades"
          type="checkbox"
          role="switch"
          className={styles.interruptorControl}
          checked={cuenta.recibirNovedades}
          disabled={guardando}
          aria-busy={guardando}
          onChange={(e) => alternar(e.target.checked)}
        />
      </label>
    </BloqueCuenta>
  );
}
