import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerPassword, validarTokenRecuperacion } from '../../services/auth';
import InputPassword from '../../components/ui/InputPassword';
import RequisitosPassword from './RequisitosPassword';
import { VALIDADORES } from './validacionRegistro';

const AVISO_LISTO = 'Listo, ya podés ingresar con tu nueva contraseña';

export default function RestablecerPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [estado, setEstado] = useState(token ? 'validando' : 'invalido');
  const [intento, setIntento] = useState(0);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let ignorar = false;
    validarTokenRecuperacion(token)
      .then(() => !ignorar && setEstado('valido'))
      .catch((err) => {
        if (!ignorar) setEstado(err.status === 404 ? 'invalido' : 'sin-conexion');
      });
    return () => {
      ignorar = true;
    };
  }, [token, intento]);

  const enviar = async (e) => {
    e.preventDefault();
    const invalida = VALIDADORES.password({ password });
    if (invalida) {
      setError(invalida);
      return;
    }
    setError('');
    setEnviando(true);
    try {
      const { email } = await restablecerPassword(token, password);
      navigate('/login', { replace: true, state: { email, aviso: AVISO_LISTO } });
    } catch (err) {
      if (err.status === 404) setEstado('invalido');
      else setError(err.detalles?.length ? err.detalles.map((d) => d.replace(/^\w+: /, '')).join('. ') : err.message);
      setEnviando(false);
    }
  };

  return (
    <section className="section acceso">
      <title>Elegí una contraseña nueva | CineClick</title>
      <div className="acceso-tarjeta acceso-tarjeta-izquierda">
        {estado === 'validando' && (
          <p className="form-ayuda" role="status">
            Revisando el enlace…
          </p>
        )}

        {estado === 'sin-conexion' && (
          <div className="acceso-pasos">
            <h1 className="acceso-titulo">No pudimos revisar el enlace</h1>
            <p className="form-ayuda">Revisá tu conexión y probá de nuevo.</p>
            <button
              type="button"
              className="btn btn-primary btn-bloque"
              onClick={() => {
                setEstado('validando');
                setIntento((n) => n + 1);
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {estado === 'invalido' && (
          <div className="acceso-pasos">
            <h1 className="acceso-titulo">Este enlace venció o ya se usó</h1>
            <p className="form-ayuda">Los enlaces duran 30 minutos y sirven una sola vez. Pedí uno nuevo para cambiar la contraseña.</p>
            <Link to="/login/recuperar" className="btn btn-primary btn-bloque">
              Pedir otro enlace
            </Link>
          </div>
        )}

        {estado === 'valido' && (
          <>
            <h1 className="acceso-titulo">Elegí una contraseña nueva</h1>
            <form className="form" onSubmit={enviar} noValidate>
              <div className="form-group">
                <label htmlFor="nueva-password">Contraseña nueva</label>
                <InputPassword
                  id="nueva-password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={['nueva-password-requisitos', error ? 'nueva-password-error' : null].filter(Boolean).join(' ')}
                />
              </div>
              <RequisitosPassword id="nueva-password-requisitos" password={password} />
              {error && (
                <p id="nueva-password-error" className="form-error" role="alert" data-icono="error">
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary btn-bloque" disabled={enviando} aria-busy={enviando}>
                {enviando && <span className="spinner-boton" aria-hidden="true" />}
                {enviando ? 'Cambiando contraseña…' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
