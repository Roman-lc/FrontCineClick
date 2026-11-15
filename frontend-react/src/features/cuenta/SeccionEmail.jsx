import { useRef, useState } from 'react';
import { cancelarCambioEmail, erroresPorCampo, pedirCambioEmail, reenviarCambioEmail } from '../../services/cuenta';
import { useToast } from '../../components/ui/useToast';
import InputPassword from '../../components/ui/InputPassword';
import { horaCorta } from '../../lib/fechas';
import { VALIDADORES } from '../auth/validacionRegistro';
import BloqueCuenta, { AccionesEdicion, DatosLectura } from './BloqueCuenta';
import CampoCuenta from './CampoCuenta';
import { useFormulario } from './useFormulario';
import styles from './miCuenta.module.css';

const VALIDADORES_EMAIL = {
  email: (v) => VALIDADORES.email(v),
  contrasena: (v) => (v.contrasena ? null : 'Ingresá tu contraseña actual'),
};

export default function SeccionEmail({ cuenta, editando, onEditar, onCancelar, onGuardado, onActualizar, onSucio }) {
  const { mostrarAviso } = useToast();
  const [trabajando, setTrabajando] = useState('');

  const accionPendiente = async (tipo, pedido, mensaje) => {
    setTrabajando(tipo);
    try {
      onActualizar(await pedido());
      mostrarAviso(mensaje, 'exito');
    } catch (err) {
      mostrarAviso(err.message || 'No se pudo completar. Intentá de nuevo.', 'error');
    } finally {
      setTrabajando('');
    }
  };

  return (
    <BloqueCuenta id="email" titulo="Email" editando={editando} onEditar={onEditar} textoEditar="Cambiar email">
      {editando ? (
        <FormularioEmail cuenta={cuenta} onCancelar={onCancelar} onGuardado={onGuardado} onSucio={onSucio} />
      ) : (
        <>
          <DatosLectura filas={[['Email actual', cuenta.email]]} />
          {cuenta.emailPendiente && (
            <div className={styles.pendiente} role="status">
              <p>
                Pendiente de confirmación: <strong>{cuenta.emailPendiente}</strong>
              </p>
              <p className="form-ayuda">
                Abrí el enlace que te mandamos a ese email antes de las {horaCorta(cuenta.emailPendienteExpiraEn)}. Hasta entonces seguís
                ingresando con {cuenta.email}.
              </p>
              <div className={styles.accionesEnLinea}>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={Boolean(trabajando)}
                  onClick={() => accionPendiente('reenviar', reenviarCambioEmail, `Te reenviamos el enlace a ${cuenta.emailPendiente}`)}
                >
                  {trabajando === 'reenviar' ? 'Reenviando…' : 'Reenviar'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={Boolean(trabajando)}
                  onClick={() => accionPendiente('cancelar', cancelarCambioEmail, 'Cancelaste el cambio de email')}
                >
                  {trabajando === 'cancelar' ? 'Cancelando…' : 'Cancelar el cambio'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </BloqueCuenta>
  );
}

function FormularioEmail({ cuenta, onCancelar, onGuardado, onSucio }) {
  const [iniciales] = useState({ email: '', contrasena: '' });
  const { valores, cambiar, salir, validarTodo, error, setServidor } = useFormulario(iniciales, VALIDADORES_EMAIL, onSucio);
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const formRef = useRef(null);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const primero = validarTodo();
    if (primero) {
      formRef.current?.elements.namedItem(primero)?.focus();
      return;
    }
    const email = valores.email.trim().toLowerCase();
    if (email === cuenta.email.toLowerCase()) {
      setServidor({ email: 'Ese ya es el email de tu cuenta' });
      return;
    }
    setGuardando(true);
    try {
      onGuardado(await pedirCambioEmail(email, valores.contrasena), `Te mandamos un enlace a ${email} para confirmar el cambio`);
    } catch (err) {
      const porCampo = erroresPorCampo(err);
      if (err.status === 409) porCampo.email = err.message;
      setServidor(porCampo);
      if (!Object.keys(porCampo).length) setErrorGeneral(err.message || 'No se pudo pedir el cambio.');
      setGuardando(false);
    }
  };

  return (
    <form ref={formRef} className={styles.formulario} onSubmit={enviar} noValidate>
      <p className="form-ayuda">
        Te vamos a mandar un enlace al email nuevo. El cambio se aplica cuando lo abras (vence en 30 minutos).
      </p>
      <CampoCuenta id="cuenta-email-nuevo" etiqueta="Email nuevo" error={error('email')}>
        {(a11y) => (
          <input
            {...a11y}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={100}
            placeholder="nombre@ejemplo.com"
            className="form-input"
            value={valores.email}
            onChange={(e) => cambiar('email', e.target.value)}
            onBlur={() => salir('email', (v) => v.trim().toLowerCase())}
          />
        )}
      </CampoCuenta>
      <CampoCuenta id="cuenta-email-contrasena" etiqueta="Contraseña actual" error={error('contrasena')}>
        {(a11y) => (
          <InputPassword
            {...a11y}
            name="contrasena"
            autoComplete="current-password"
            value={valores.contrasena}
            onChange={(e) => cambiar('contrasena', e.target.value)}
            onBlur={() => salir('contrasena')}
          />
        )}
      </CampoCuenta>
      {errorGeneral && (
        <p className="form-error" role="alert" data-icono="error">
          {errorGeneral}
        </p>
      )}
      <AccionesEdicion guardando={guardando} onCancelar={onCancelar} textoGuardar="Enviar enlace" textoGuardando="Enviando…" />
    </form>
  );
}
