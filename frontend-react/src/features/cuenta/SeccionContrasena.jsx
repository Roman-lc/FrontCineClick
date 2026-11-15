import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cambiarContrasena, erroresPorCampo } from '../../services/cuenta';
import InputPassword from '../../components/ui/InputPassword';
import { fechaHoraCorta } from '../../lib/fechas';
import { VALIDADORES } from '../auth/validacionRegistro';
import RequisitosPassword from '../auth/RequisitosPassword';
import BloqueCuenta, { AccionesEdicion, DatosLectura } from './BloqueCuenta';
import CampoCuenta from './CampoCuenta';
import { useFormulario } from './useFormulario';
import styles from './miCuenta.module.css';

const VALIDADORES_CONTRASENA = {
  actual: (v) => (v.actual ? null : 'Ingresá tu contraseña actual'),
  nueva: (v) => {
    const error = VALIDADORES.password({ password: v.nueva });
    if (error) return error;
    if (v.nueva === v.actual) return 'La contraseña nueva tiene que ser distinta de la actual';
    return null;
  },
};

export default function SeccionContrasena({ cuenta, editando, onEditar, onCancelar, onGuardado, onSucio }) {
  const ultima = cuenta.contrasenaModificadaEn ? fechaHoraCorta(cuenta.contrasenaModificadaEn) : null;
  return (
    <BloqueCuenta id="contrasena" titulo="Contraseña" editando={editando} onEditar={onEditar} textoEditar="Cambiar contraseña">
      {editando ? (
        <FormularioContrasena email={cuenta.email} onCancelar={onCancelar} onGuardado={onGuardado} onSucio={onSucio} />
      ) : (
        <DatosLectura filas={[['Última modificación', ultima]]} />
      )}
    </BloqueCuenta>
  );
}

function FormularioContrasena({ email, onCancelar, onGuardado, onSucio }) {
  const [iniciales] = useState({ actual: '', nueva: '' });
  const { valores, cambiar, salir, validarTodo, error, setServidor } = useFormulario(iniciales, VALIDADORES_CONTRASENA, onSucio);
  const [verNueva, setVerNueva] = useState(false);
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
    setGuardando(true);
    try {
      onGuardado(await cambiarContrasena(valores.actual, valores.nueva), 'Contraseña actualizada');
    } catch (err) {
      const porCampo = erroresPorCampo(err);
      setServidor(porCampo);
      if (!Object.keys(porCampo).length) setErrorGeneral(err.message || 'No se pudo cambiar la contraseña.');
      setGuardando(false);
    }
  };

  return (
    <form ref={formRef} className={styles.formulario} onSubmit={enviar} noValidate>
      <CampoCuenta
        id="cuenta-contrasena-actual"
        etiqueta="Contraseña actual"
        error={error('actual')}
        extra={
          <Link to="/login/recuperar" state={{ email }} className="form-enlace-chico">
            ¿No recordás tu contraseña actual?
          </Link>
        }
      >
        {(a11y) => (
          <InputPassword
            {...a11y}
            name="actual"
            autoComplete="current-password"
            value={valores.actual}
            onChange={(e) => cambiar('actual', e.target.value)}
            onBlur={() => salir('actual')}
          />
        )}
      </CampoCuenta>
      <CampoCuenta id="cuenta-contrasena-nueva" etiqueta="Contraseña nueva" error={error('nueva')}>
        {(a11y) => (
          <InputPassword
            {...a11y}
            aria-describedby={[a11y['aria-describedby'], 'cuenta-contrasena-requisitos'].filter(Boolean).join(' ')}
            name="nueva"
            autoComplete="new-password"
            value={valores.nueva}
            visible={verNueva}
            onAlternar={() => setVerNueva((v) => !v)}
            onChange={(e) => cambiar('nueva', e.target.value)}
            onBlur={() => salir('nueva')}
          />
        )}
      </CampoCuenta>
      <RequisitosPassword id="cuenta-contrasena-requisitos" password={valores.nueva} />
      {errorGeneral && (
        <p className="form-error" role="alert" data-icono="error">
          {errorGeneral}
        </p>
      )}
      <AccionesEdicion guardando={guardando} onCancelar={onCancelar} textoGuardar="Cambiar contraseña" textoGuardando="Cambiando…" />
    </form>
  );
}
