import { useEffect, useId, useRef, useState } from 'react';
import InputPassword from '../../components/ui/InputPassword';
import { erroresPorCampo } from '../../services/cuenta';
import styles from './miCuenta.module.css';

export default function DialogoContrasena({ abierto, titulo, children, textoConfirmar, textoProcesando, peligro, onConfirmar, onCerrar }) {
  const ref = useRef(null);
  const id = useId();
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  const cerrar = () => {
    if (enviando) return;
    setContrasena('');
    setError('');
    onCerrar();
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!contrasena) {
      setError('Ingresá tu contraseña');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await onConfirmar(contrasena);
      setContrasena('');
    } catch (err) {
      setError(erroresPorCampo(err).contrasena || err.message || 'No se pudo completar. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby={`${id}-titulo`}
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
    >
      {abierto && (
        <form onSubmit={enviar} noValidate className={styles.dialogoForm}>
          <h2 id={`${id}-titulo`} className={styles.dialogoTitulo}>
            {titulo}
          </h2>
          {children}
          <div className="form-group">
            <label htmlFor={`${id}-contrasena`}>Tu contraseña</label>
            <InputPassword
              id={`${id}-contrasena`}
              name="contrasena"
              autoComplete="current-password"
              value={contrasena}
              autoFocus
              onChange={(e) => {
                setContrasena(e.target.value);
                setError('');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && (
              <p id={`${id}-error`} className="form-error" role="alert" data-icono="error">
                {error}
              </p>
            )}
          </div>
          <div className={styles.dialogoAcciones}>
            <button type="button" className="btn" onClick={cerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className={`btn ${peligro ? 'btn-danger-lleno' : 'btn-primary'}`} disabled={enviando} aria-busy={enviando}>
              {enviando && <span className="spinner-boton" aria-hidden="true" />}
              {enviando ? textoProcesando : textoConfirmar}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
