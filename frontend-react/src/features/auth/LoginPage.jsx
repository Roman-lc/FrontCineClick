import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/http';
import { useToast } from '../../components/ui/ToastProvider';

// modoInicial: 'login' o 'registro' (la ruta /registro abre directo la pestaña de crear cuenta)
export default function LoginPage({ modoInicial = 'login' }) {
  const [tab, setTab] = useState(modoInicial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      mostrarAviso('Por favor completá email y contraseña', 'error');
      return;
    }
    try {
      const data = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('cineclick_user', JSON.stringify({
        nombre: data.nombreCompleto || data.nombre || email,
        email: data.email || email,
        rol: data.rol || '',
      }));
      if (data.token) localStorage.setItem('cineclick_token', data.token);
      mostrarAviso('Login exitoso', 'exito');
      window.location.href = '/';
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!regNombre || !regApellido || !regEmail || !regPassword) {
      mostrarAviso('Completá nombre, apellido, email y contraseña', 'error');
      return;
    }
    if (regPassword.length < 4) {
      mostrarAviso('La contraseña tiene que tener al menos 4 caracteres', 'error');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      mostrarAviso('Las contraseñas no coinciden', 'error');
      return;
    }
    try {
      await api.post('/api/clientes', {
        nombre: regNombre,
        apellido: regApellido,
        email: regEmail,
        password: regPassword,
        telefono: regTelefono || null,
      });
      const data = await api.post('/api/auth/login', { email: regEmail, password: regPassword });
      localStorage.setItem('cineclick_user', JSON.stringify({
        nombre: data.nombreCompleto || `${regNombre} ${regApellido}`,
        email: data.email || regEmail,
        rol: data.rol || '',
      }));
      if (data.token) localStorage.setItem('cineclick_token', data.token);
      mostrarAviso('¡Cuenta creada con éxito!', 'exito');
      window.location.href = '/';
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <h2>Acceso a CineClick</h2>
      <div className="tabs">
        <button type="button" className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Iniciar Sesión</button>
        <button type="button" className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => setTab('registro')}>Crear Cuenta</button>
      </div>

      {tab === 'login' && (
        <div className="tab-panel" style={{ display: 'flex' }}>
          <form className="form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Iniciar Sesión</button>
            <p className="form-hint">¿No tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('registro'); }}>Registrate aquí</a></p>
          </form>
        </div>
      )}

      {tab === 'registro' && (
        <div className="tab-panel" style={{ display: 'flex' }}>
          <form className="form" onSubmit={handleRegistro}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" className="form-input" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" className="form-input" value={regApellido} onChange={(e) => setRegApellido(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" className="form-input" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" className="form-input" value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Teléfono <span className="form-hint-inline">(opcional)</span></label>
              <input type="text" className="form-input" value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Crear Cuenta</button>
            <p className="form-hint">¿Ya tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login'); }}>Iniciar sesión</a></p>
          </form>
        </div>
      )}
    </section>
  );
}
