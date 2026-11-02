import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { CUENTAS_DEMO } from '../../lib/cuentasDemo';
import { iniciarSesion } from '../../services/auth';
import { useToast } from '../ui/useToast';
import styles from './CuentasDemo.module.css';

const CLAVE_PLEGADO = 'cineclick_demo_plegado';
const leerPlegado = () => {
  try {
    return localStorage.getItem(CLAVE_PLEGADO) === 'true';
  } catch {
    return false;
  }
};

// Listado de las cuentas del seed con un boton que inicia sesion con cada una. Con plegable va como panel
// plegable (recuerda si se plego); en el login, como lista debajo del formulario. destino: ruta a la que ir despues
// de ingresar (si no, la de cada cuenta).
export default function CuentasDemo({ plegable = false, destino }) {
  const { login } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const id = useId();
  const [plegado, setPlegado] = useState(() => plegable && leerPlegado());
  const [ingresando, setIngresando] = useState('');

  const alternar = () => {
    setPlegado((p) => {
      try {
        localStorage.setItem(CLAVE_PLEGADO, String(!p));
      } catch {
        // Sin storage, el panel se abre de nuevo al recargar
      }
      return !p;
    });
  };

  const ingresar = async (cuenta) => {
    setIngresando(cuenta.email);
    try {
      login(await iniciarSesion(cuenta.email, cuenta.password));
      mostrarAviso(`Ingresaste como ${cuenta.nombre} (${cuenta.rol.toLowerCase()})`, 'exito');
      navigate(cuenta.rol === 'Administrador' ? cuenta.destino : destino || cuenta.destino);
    } catch (err) {
      mostrarAviso(err.status === 401 ? 'Esa cuenta no existe en la base: reiniciá la demo (ver README).' : 'No se pudo ingresar. ¿Está corriendo el backend?', 'error');
    } finally {
      setIngresando('');
    }
  };

  const lista = (
    <ul className={styles.lista} id={`${id}-cuentas`}>
      {CUENTAS_DEMO.map((c) => (
        <li key={c.email} className={styles.cuenta}>
          <p className={styles.rol}>{c.rol}</p>
          <p className={styles.muestra}>{c.muestra}</p>
          <dl className={styles.credenciales}>
            <dt>Email</dt>
            <dd>{c.email}</dd>
            <dt>Contraseña</dt>
            <dd>{c.password}</dd>
          </dl>
          <button type="button" className="btn btn-sm" onClick={() => ingresar(c)} disabled={Boolean(ingresando)}>
            {ingresando === c.email ? 'Ingresando…' : 'Ingresar con esta cuenta'}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.panel} aria-labelledby={`${id}-titulo`}>
      <div className={styles.cabecera}>
        <h2 id={`${id}-titulo`} className={styles.titulo}>
          Cuentas de prueba
        </h2>
        {plegable && (
          <button type="button" className={styles.plegar} aria-expanded={!plegado} aria-controls={`${id}-cuentas`} onClick={alternar}>
            {plegado ? 'Mostrar' : 'Ocultar'}
          </button>
        )}
      </div>
      {!plegado && (
        <>
          <p className={styles.bajada}>Datos de demostración: cada cuenta muestra un caso distinto del sitio.</p>
          {lista}
        </>
      )}
    </section>
  );
}
