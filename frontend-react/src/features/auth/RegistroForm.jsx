import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCines } from '../../services/cines';
import { nombreCine } from '../../lib/formato';
import { limitarTelefono } from '../../lib/normalizar';
import InputPassword from '../../components/ui/InputPassword';
import RequisitosPassword from './RequisitosPassword';
import {
  CAMPOS,
  EDAD_MINIMA,
  GENEROS,
  VALIDADORES,
  armarRegistro,
  fechaMaximaNacimientoISO,
  validarRegistro,
} from './validacionRegistro';

const VACIO = {
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  cinePreferidoId: '',
  genero: '',
  password: '',
  passwordConfirm: '',
  aceptaTerminos: false,
};

function Campo({ id, etiqueta, error, ayuda, children }) {
  const idTexto = `${id}-texto`;
  const textoDebajo = error || ayuda;
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {etiqueta} <span className="form-obligatorio" aria-hidden="true">*</span>
      </label>
      {children({ id, 'aria-describedby': textoDebajo ? idTexto : undefined, 'aria-invalid': error ? true : undefined, 'aria-required': true })}
      {error ? (
        <p id={idTexto} className="form-error" data-icono="error">{error}</p>
      ) : (
        ayuda && <p id={idTexto} className="form-ayuda">{ayuda}</p>
      )}
    </div>
  );
}

export default function RegistroForm({ onRegistrar, onIrALogin }) {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [emailDuplicado, setEmailDuplicado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cines, setCines] = useState({ cargando: true, error: false, lista: [] });
  const [intentoCines, setIntentoCines] = useState(0);
  const [verPassword, setVerPassword] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    let ignorar = false;
    getCines()
      .then((lista) => {
        if (ignorar) return;
        const activos = lista
          .filter((c) => c.activo !== false)
          .sort((a, b) => nombreCine(a.nombre).localeCompare(nombreCine(b.nombre), 'es'));
        setCines({ cargando: false, error: false, lista: activos });
      })
      .catch(() => {
        if (!ignorar) setCines({ cargando: false, error: true, lista: [] });
      });
    return () => {
      ignorar = true;
    };
  }, [intentoCines]);

  const validarCampo = (campo, nuevos) => {
    const error = VALIDADORES[campo](nuevos);
    setErrores((prev) => ({ ...prev, [campo]: error ?? undefined }));
  };

  const cambiar = (campo) => (e) => {
    let valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (campo === 'telefono') valor = limitarTelefono(valor);
    const nuevos = { ...valores, [campo]: valor };
    setValores(nuevos);
    if (campo === 'email') setEmailDuplicado('');
    if (campo === 'aceptaTerminos') {
      setTocados((prev) => ({ ...prev, aceptaTerminos: true }));
      validarCampo(campo, nuevos);
    }
    if (tocados[campo]) validarCampo(campo, nuevos);
    if (campo === 'password' && tocados.passwordConfirm) validarCampo('passwordConfirm', nuevos);
  };

  const salir = (campo) => () => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    validarCampo(campo, valores);
  };

  const props = (campo) => ({
    name: campo,
    value: valores[campo],
    onChange: cambiar(campo),
    onBlur: salir(campo),
    className: 'form-input',
  });

  const errorVisible = (campo) => (tocados[campo] ? errores[campo] : undefined);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setEmailDuplicado('');
    const encontrados = validarRegistro(valores);
    setErrores(encontrados);
    setTocados(Object.fromEntries(CAMPOS.map((c) => [c, true])));
    const primero = CAMPOS.find((c) => encontrados[c]);
    if (primero) {
      const cantidad = Object.keys(encontrados).length;
      setErrorGeneral(cantidad === 1 ? 'Revisá el campo marcado.' : `Revisá los ${cantidad} campos marcados.`);
      formRef.current?.elements.namedItem(primero)?.focus();
      return;
    }
    setEnviando(true);
    const datos = armarRegistro(valores);
    try {
      await onRegistrar(datos);
    } catch (err) {
      if (err.status === 409) setEmailDuplicado(datos.email);
      else setErrorGeneral(err.message || 'No se pudo crear la cuenta. Intentá de nuevo.');
      setEnviando(false);
    }
  };

  const fechaMaxima = fechaMaximaNacimientoISO();
  const errorTerminos = errorVisible('aceptaTerminos');

  return (
    <form ref={formRef} className="form" onSubmit={enviar} noValidate>
      <p className="form-ayuda">
        Todos los campos son obligatorios <span className="form-obligatorio" aria-hidden="true">*</span>
      </p>

      <Campo id="reg-nombre" etiqueta="Nombre" error={errorVisible('nombre')}>
        {(a11y) => <input {...a11y} {...props('nombre')} type="text" autoComplete="given-name" maxLength={50} />}
      </Campo>

      <Campo id="reg-apellido" etiqueta="Apellido" error={errorVisible('apellido')}>
        {(a11y) => <input {...a11y} {...props('apellido')} type="text" autoComplete="family-name" maxLength={50} />}
      </Campo>

      <Campo id="reg-email" etiqueta="Correo electrónico" error={errorVisible('email')}>
        {(a11y) => <input {...a11y} {...props('email')} type="email" autoComplete="email" inputMode="email" maxLength={100} placeholder="nombre@ejemplo.com" />}
      </Campo>

      <Campo id="reg-fecha" etiqueta="Fecha de nacimiento" error={errorVisible('fechaNacimiento')} ayuda={`Tenés que tener al menos ${EDAD_MINIMA} años.`}>
        {(a11y) => <input {...a11y} {...props('fechaNacimiento')} type="date" autoComplete="bday" max={fechaMaxima} min="1900-01-01" />}
      </Campo>

      <Campo id="reg-telefono" etiqueta="Número de teléfono" error={errorVisible('telefono')} ayuda="Con código de área y sin el 15.">
        {(a11y) => <input {...a11y} {...props('telefono')} type="tel" autoComplete="tel-national" inputMode="tel" maxLength={20} placeholder="11 4000 1000" />}
      </Campo>

      <Campo
        id="reg-cine"
        etiqueta="Complejo de preferencia"
        error={errorVisible('cinePreferidoId') || (cines.error ? 'No pudimos cargar los complejos.' : undefined)}
      >
        {(a11y) => (
          <select {...a11y} {...props('cinePreferidoId')} disabled={cines.cargando || cines.error}>
            <option value="">{cines.cargando ? 'Cargando complejos…' : 'Elegí un complejo'}</option>
            {cines.lista.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {nombreCine(c.nombre)}
                {c.localidad && c.localidad !== nombreCine(c.nombre) ? ` (${c.localidad})` : ''}
              </option>
            ))}
          </select>
        )}
      </Campo>
      {cines.error && (
        <button type="button" className="btn btn-sm" onClick={() => { setCines({ cargando: true, error: false, lista: [] }); setIntentoCines((n) => n + 1); }}>
          Reintentar carga de complejos
        </button>
      )}

      <Campo id="reg-genero" etiqueta="Género" error={errorVisible('genero')}>
        {(a11y) => (
          <select {...a11y} {...props('genero')}>
            <option value="">Elegí una opción</option>
            {GENEROS.map((g) => (
              <option key={g.valor} value={g.valor}>{g.texto}</option>
            ))}
          </select>
        )}
      </Campo>

      <Campo id="reg-password" etiqueta="Contraseña" error={errorVisible('password')}>
        {(a11y) => (
          <InputPassword
            {...a11y}
            {...props('password')}
            aria-describedby={[a11y['aria-describedby'], 'reg-password-requisitos'].filter(Boolean).join(' ')}
            autoComplete="new-password"
            visible={verPassword}
            onAlternar={() => setVerPassword((v) => !v)}
            controla="reg-password reg-password-confirm"
          />
        )}
      </Campo>
      <RequisitosPassword id="reg-password-requisitos" password={valores.password} />

      <Campo id="reg-password-confirm" etiqueta="Repetir contraseña" error={errorVisible('passwordConfirm')}>
        {(a11y) => <input {...a11y} {...props('passwordConfirm')} type={verPassword ? 'text' : 'password'} autoComplete="new-password" />}
      </Campo>

      <div className="form-group">
        <div className="form-check">
          <input
            id="reg-terminos"
            type="checkbox"
            name="aceptaTerminos"
            checked={valores.aceptaTerminos}
            onChange={cambiar('aceptaTerminos')}
            aria-required="true"
            aria-invalid={errorTerminos ? true : undefined}
            aria-describedby={errorTerminos ? 'reg-terminos-texto' : undefined}
          />
          <label htmlFor="reg-terminos">
            Acepto los{' '}
            <a href="/terminos" target="_blank" rel="noopener noreferrer">
              términos y condiciones<span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>{' '}
            y la{' '}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer">
              política de privacidad<span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>{' '}
            <span className="form-obligatorio" aria-hidden="true">*</span>
          </label>
        </div>
        {errorTerminos && (
          <p id="reg-terminos-texto" className="form-error" data-icono="error">
            {errorTerminos}
          </p>
        )}
      </div>

      {errorGeneral && <p className="form-error form-error-general" role="alert" data-icono="error">{errorGeneral}</p>}
      {emailDuplicado && (
        <div className="form-error form-error-general form-error-bloque" role="alert">
          <p data-icono="error">Ya existe una cuenta con ese email</p>
          <p className="form-error-acciones">
            <a href="#" onClick={(e) => { e.preventDefault(); onIrALogin(emailDuplicado); }}>Iniciar sesión</a>
            <Link to="/login/recuperar" state={{ email: emailDuplicado }}>Recuperar contraseña</Link>
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-bloque" disabled={enviando} aria-busy={enviando} onMouseDown={(e) => e.preventDefault()}>
        {enviando && <span className="spinner-boton" aria-hidden="true" />}
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}
