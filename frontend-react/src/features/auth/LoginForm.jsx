import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputPassword from '../../components/ui/InputPassword';

export default function LoginForm({ email, onCambiarEmail, onIngresar }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    const limpio = email.trim().toLowerCase();
    onCambiarEmail(limpio);
    if (!limpio || !password) {
      setError('Completá tu email y tu contraseña');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await onIngresar(limpio, password);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión. Intentá de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <form className="form" onSubmit={enviar} noValidate>
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="form-input"
          value={email}
          onChange={(e) => {
            onCambiarEmail(e.target.value);
            setError('');
          }}
          onBlur={() => onCambiarEmail(email.trim().toLowerCase())}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <div className="form-group">
        <div className="form-label-fila">
          <label htmlFor="login-password">Contraseña</label>
          <Link to="/login/recuperar" state={{ email: email.trim().toLowerCase() }} className="form-enlace-chico">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <InputPassword
          id="login-password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      {error && (
        <p id="login-error" className="form-error form-error-general" role="alert" data-icono="error">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-bloque" disabled={enviando} aria-busy={enviando}>
        {enviando && <span className="spinner-boton" aria-hidden="true" />}
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
