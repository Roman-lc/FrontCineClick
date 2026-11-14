import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { restablecerPassword } from '../../services/auth';

export default function RestablecerPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError(''); setMensaje('');
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirmacion) { setError('Las contraseñas no coinciden.'); return; }
    setEnviando(true);
    try {
      const respuesta = await restablecerPassword(token, password);
      setMensaje(respuesta.mensaje);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) { setError(err.message || 'El enlace no es válido o venció.'); }
    finally { setEnviando(false); }
  };

  return (
    <section className="section">
      <title>Crear nueva contraseña | CineClick</title>
      <h2>Crear nueva contraseña</h2>
      {!token ? <p role="alert">Falta el código de recuperación. Solicitá un enlace nuevo.</p> : (
        <form className="form" onSubmit={enviar}>
          <div className="form-group">
            <label htmlFor="nueva-password">Nueva contraseña</label>
            <input id="nueva-password" type="password" autoComplete="new-password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmar-password">Repetir contraseña</label>
            <input id="confirmar-password" type="password" autoComplete="new-password" className="form-input" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={enviando}>Guardar contraseña</button>
          {error && <p role="alert">{error}</p>}
          {mensaje && <p role="status">{mensaje}</p>}
        </form>
      )}
      <p className="form-hint"><Link to="/login">Volver al inicio de sesión</Link></p>
    </section>
  );
}
