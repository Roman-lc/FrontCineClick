import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { solicitarRecuperacion } from '../../services/auth';
import { VALIDADORES } from './validacionRegistro';

const SEGUNDOS_PARA_REENVIAR = 120;

export default function RecuperarPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviadoA, setEnviadoA] = useState('');
  const [segundos, setSegundos] = useState(0);
  const confirmacionRef = useRef(null);

  useEffect(() => {
    if (segundos <= 0) return undefined;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  const pedir = async (destino) => {
    setError('');
    setEnviando(true);
    try {
      await solicitarRecuperacion(destino);
      setEnviadoA(destino);
      setSegundos(SEGUNDOS_PARA_REENVIAR);
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace. Intentá de nuevo.');
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    const limpio = email.trim().toLowerCase();
    setEmail(limpio);
    const invalido = VALIDADORES.email({ email: limpio });
    if (invalido) {
      setError(invalido);
      return;
    }
    if (await pedir(limpio)) {
      setTimeout(() => confirmacionRef.current?.focus(), 0);
    }
  };

  return (
    <section className="section acceso">
      <title>Recuperar contraseña | CineClick</title>
      <div className="acceso-tarjeta acceso-tarjeta-izquierda">
        <h1 className="acceso-titulo">Recuperar contraseña</h1>

        {enviadoA ? (
          <div className="acceso-pasos">
            <p ref={confirmacionRef} tabIndex={-1} className="acceso-confirmacion" data-icono="ok">
              <span>
                Si <strong>{enviadoA}</strong> tiene una cuenta, te enviamos un enlace para cambiar la contraseña. Vence en 30
                minutos.
              </span>
            </p>
            {error && (
              <p className="form-error" role="alert" data-icono="error">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-bloque" disabled={segundos > 0 || enviando} onClick={() => pedir(enviadoA)}>
              {enviando && <span className="spinner-boton" aria-hidden="true" />}
              {segundos > 0 ? `Reenviar (en ${segundos} s)` : 'Reenviar'}
            </button>
            <p className="form-hint">
              <Link to="/login" state={{ email: enviadoA }}>
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        ) : (
          <form className="form" onSubmit={enviar} noValidate>
            <p className="form-ayuda">Te enviamos un enlace al correo de tu cuenta.</p>
            <div className="form-group">
              <label htmlFor="recuperar-email">Email</label>
              <input
                id="recuperar-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className="form-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onBlur={() => setEmail(email.trim().toLowerCase())}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'recuperar-error' : undefined}
              />
            </div>
            {error && (
              <p id="recuperar-error" className="form-error" role="alert" data-icono="error">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-bloque" disabled={enviando} aria-busy={enviando}>
              {enviando && <span className="spinner-boton" aria-hidden="true" />}
              {enviando ? 'Enviando…' : 'Enviar enlace'}
            </button>
            <p className="form-hint">
              <Link to="/login" state={{ email: email.trim().toLowerCase() }}>
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
