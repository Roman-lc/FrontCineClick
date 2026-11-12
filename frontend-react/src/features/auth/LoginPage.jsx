import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { iniciarSesion, registrarCliente, solicitarRecuperacion } from '../../services/auth';
import { useToast } from '../../components/ui/useToast';
import { rutaVolverSegura } from '../../lib/volver';
import CuentasDemo from '../../components/demo/CuentasDemo';
import { DEMO_ACTIVA } from '../../lib/cuentasDemo';

// modoInicial: 'login' o 'registro' (la ruta /registro abre directo la pestaña de crear cuenta).
// ?volver=/compra/12/entradas hace que despues de ingresar se vuelva a esa pantalla.
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
  const [enviando, setEnviando] = useState(false);
  const [recuperar, setRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [mensajeRecuperar, setMensajeRecuperar] = useState('');
  const { login } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const volver = rutaVolverSegura(searchParams.get('volver'));

  const entrar = async (correo, clave, mensaje) => {
    const data = await iniciarSesion(correo, clave);
    login(data);
    mostrarAviso(mensaje, 'exito');
    navigate(volver || '/', { replace: true });
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    if (!emailRecuperar.trim()) { mostrarAviso('Ingresá tu email', 'error'); return; }
    setEnviando(true);
    try {
      const respuesta = await solicitarRecuperacion(emailRecuperar.trim());
      setMensajeRecuperar(respuesta.mensaje);
    } catch (err) { mostrarAviso(err.message, 'error'); }
    finally { setEnviando(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      mostrarAviso('Por favor completá email y contraseña', 'error');
      return;
    }
    setEnviando(true);
    try {
      await entrar(email, password, 'Login exitoso');
    } catch (err) {
      mostrarAviso(err.message, 'error');
      setEnviando(false);
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
    setEnviando(true);
    try {
      await registrarCliente({
        nombre: regNombre,
        apellido: regApellido,
        email: regEmail,
        password: regPassword,
        telefono: regTelefono || null,
      });
      await entrar(regEmail, regPassword, '¡Cuenta creada con éxito!');
    } catch (err) {
      mostrarAviso(err.message, 'error');
      setEnviando(false);
    }
  };

  return (
    <section className="section">
      <title>Ingresar | CineClick</title>
      <h2>Acceso a CineClick</h2>
      {volver?.startsWith('/compra') && <p className="form-hint">Ingresá con tu cuenta para continuar con la compra.</p>}
      <div className="tabs">
        <button type="button" className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Iniciar Sesión</button>
        <button type="button" className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => setTab('registro')}>Crear Cuenta</button>
      </div>

      {tab === 'login' && (
        <div className="tab-panel" style={{ display: 'flex' }}>
          {recuperar ? (
            <form className="form" onSubmit={handleRecuperar}>
              <h3>Recuperar contraseña</h3>
              <p className="form-hint">Te enviaremos un enlace al correo asociado a tu cuenta.</p>
              <div className="form-group">
                <label htmlFor="recuperar-email">Email</label>
                <input id="recuperar-email" type="email" autoComplete="email" className="form-input" value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={enviando}>Enviar enlace</button>
              {mensajeRecuperar && <p className="form-hint" role="status">{mensajeRecuperar}</p>}
              <p className="form-hint"><a href="#" onClick={(e) => { e.preventDefault(); setRecuperar(false); setMensajeRecuperar(''); }}>Volver al inicio de sesión</a></p>
            </form>
          ) : (
          <form className="form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" autoComplete="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input id="login-password" type="password" autoComplete="current-password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={enviando}>Iniciar Sesión</button>
            <p className="form-hint"><a href="#" onClick={(e) => { e.preventDefault(); setEmailRecuperar(email); setRecuperar(true); }}>¿Olvidaste tu contraseña?</a></p>
            <p className="form-hint">¿No tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('registro'); }}>Registrate aquí</a></p>
          </form>
          )}
        </div>
      )}

      {tab === 'registro' && (
        <div className="tab-panel" style={{ display: 'flex' }}>
          <form className="form" onSubmit={handleRegistro}>
            <div className="form-group">
              <label htmlFor="reg-nombre">Nombre</label>
              <input id="reg-nombre" type="text" autoComplete="given-name" className="form-input" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-apellido">Apellido</label>
              <input id="reg-apellido" type="text" autoComplete="family-name" className="form-input" value={regApellido} onChange={(e) => setRegApellido(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" autoComplete="email" className="form-input" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input id="reg-password" type="password" autoComplete="new-password" className="form-input" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password-confirm">Confirmar contraseña</label>
              <input id="reg-password-confirm" type="password" autoComplete="new-password" className="form-input" value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-telefono">Teléfono <span className="form-hint-inline">(opcional)</span></label>
              <input id="reg-telefono" type="tel" autoComplete="tel" className="form-input" value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={enviando}>Crear Cuenta</button>
            <p className="form-hint">¿Ya tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login'); }}>Iniciar sesión</a></p>
          </form>
        </div>
      )}

      {DEMO_ACTIVA && <CuentasDemo destino={volver || undefined} />}
    </section>
  );
}
