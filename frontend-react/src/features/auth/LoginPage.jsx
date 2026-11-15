import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { iniciarSesion, registrarCliente } from '../../services/auth';
import { useToast } from '../../components/ui/useToast';
import CuentasDemo from '../../components/demo/CuentasDemo';
import { DEMO_ACTIVA } from '../../lib/cuentasDemo';
import LoginForm from './LoginForm';
import RegistroForm from './RegistroForm';

const PESTANAS = [
  { id: 'login', texto: 'Iniciar sesión' },
  { id: 'registro', texto: 'Crear cuenta' },
];

export default function LoginPage({ modoInicial = 'login' }) {
  const location = useLocation();
  const [tab, setTab] = useState(modoInicial);
  const [email, setEmail] = useState(location.state?.email ?? '');
  const aviso = location.state?.aviso;
  const { login } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const pestanasRef = useRef({});

  const entrar = async (correo, clave, mensaje) => {
    const data = await iniciarSesion(correo, clave);
    login(data);
    mostrarAviso(mensaje, 'exito');
    navigate('/', { replace: true });
  };

  const handleRegistro = async (datos) => {
    await registrarCliente(datos);
    await entrar(datos.email, datos.password, '¡Cuenta creada con éxito!');
  };

  const irALogin = (correo) => {
    if (correo) setEmail(correo);
    setTab('login');
    pestanasRef.current.login?.focus();
  };

  return (
    <section className="section acceso">
      <title>{tab === 'login' ? 'Ingresar | CineClick' : 'Crear cuenta | CineClick'}</title>

      <div className="acceso-tarjeta">
        <h1 className="acceso-titulo">Ingresá a tu cuenta</h1>
        {aviso && (
          <p className="acceso-aviso" role="status" data-icono="ok">
            {aviso}
          </p>
        )}

        <div className="tabs" role="tablist" aria-label="Acceso a tu cuenta">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              ref={(el) => {
                pestanasRef.current[p.id] = el;
              }}
              type="button"
              role="tab"
              id={`pestana-${p.id}`}
              aria-selected={tab === p.id}
              aria-controls="panel-acceso"
              tabIndex={tab === p.id ? 0 : -1}
              className="tab-btn"
              onClick={() => setTab(p.id)}
            >
              {p.texto}
            </button>
          ))}
        </div>

        <div id="panel-acceso" role="tabpanel" aria-labelledby={`pestana-${tab}`}>
          {tab === 'login' ? (
            <LoginForm
              email={email}
              onCambiarEmail={setEmail}
              onIngresar={(correo, clave) => entrar(correo, clave, 'Ingresaste a tu cuenta')}
            />
          ) : (
            <RegistroForm onRegistrar={handleRegistro} onIrALogin={irALogin} />
          )}
        </div>
      </div>

      {DEMO_ACTIVA && (
        <div className="acceso-demo">
          <CuentasDemo />
        </div>
      )}
    </section>
  );
}
