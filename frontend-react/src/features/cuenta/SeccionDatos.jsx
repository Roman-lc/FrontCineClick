import { useEffect, useRef, useState } from 'react';
import { actualizarDatos, erroresPorCampo } from '../../services/cuenta';
import { getCines } from '../../services/cines';
import { nombreCine } from '../../lib/formato';
import { fechaLarga } from '../../lib/fechas';
import { formatearTelefono, formatoTitulo, limitarTelefono, normalizarTelefono } from '../../lib/normalizar';
import { GENEROS, VALIDADORES, fechaMaximaNacimientoISO } from '../auth/validacionRegistro';
import BloqueCuenta, { AccionesEdicion, DatosLectura } from './BloqueCuenta';
import CampoCuenta from './CampoCuenta';
import { useFormulario } from './useFormulario';
import styles from './miCuenta.module.css';

const CAMPOS_ADMIN = ['nombre', 'apellido'];
const CAMPOS_CLIENTE = ['nombre', 'apellido', 'telefono', 'fechaNacimiento', 'genero', 'cinePreferidoId'];

const titulo = (v) => formatoTitulo(v) ?? '';

function inicialesDe(cuenta) {
  return {
    nombre: cuenta.nombre ?? '',
    apellido: cuenta.apellido ?? '',
    telefono: cuenta.telefono ? formatearTelefono(cuenta.telefono) : '',
    fechaNacimiento: cuenta.fechaNacimiento ?? '',
    genero: cuenta.genero ?? '',
    cinePreferidoId: cuenta.cinePreferidoId ? String(cuenta.cinePreferidoId) : '',
  };
}

export default function SeccionDatos({ cuenta, editando, onEditar, onCancelar, onGuardado, onSucio }) {
  const esCliente = Boolean(cuenta.clienteId);
  const genero = GENEROS.find((g) => g.valor === cuenta.genero)?.texto;
  const filas = [
    ['Nombre', cuenta.nombre],
    ['Apellido', cuenta.apellido],
    ...(esCliente
      ? [
          ['Teléfono', cuenta.telefono && formatearTelefono(cuenta.telefono)],
          ['Fecha de nacimiento', cuenta.fechaNacimiento && fechaLarga(cuenta.fechaNacimiento)],
          ['Género', genero],
          ['Complejo de preferencia', cuenta.cinePreferidoNombre && nombreCine(cuenta.cinePreferidoNombre)],
        ]
      : []),
  ];

  return (
    <BloqueCuenta id="datos-personales" titulo="Datos personales" editando={editando} onEditar={onEditar}>
      {editando ? (
        <FormularioDatos cuenta={cuenta} esCliente={esCliente} onCancelar={onCancelar} onGuardado={onGuardado} onSucio={onSucio} />
      ) : (
        <DatosLectura filas={filas} />
      )}
    </BloqueCuenta>
  );
}

function FormularioDatos({ cuenta, esCliente, onCancelar, onGuardado, onSucio }) {
  const campos = esCliente ? CAMPOS_CLIENTE : CAMPOS_ADMIN;
  const [iniciales] = useState(() => inicialesDe(cuenta));
  const validadores = Object.fromEntries(campos.map((c) => [c, VALIDADORES[c]]));
  const { valores, cambiar, salir, validarTodo, error, setServidor } = useFormulario(iniciales, validadores, onSucio);
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cines, setCines] = useState({ cargando: esCliente, error: false, lista: [] });
  const formRef = useRef(null);

  useEffect(() => {
    if (!esCliente) return undefined;
    let ignorar = false;
    getCines()
      .then((lista) => {
        if (ignorar) return;
        const activos = lista
          .filter((c) => c.activo !== false)
          .sort((a, b) => nombreCine(a.nombre).localeCompare(nombreCine(b.nombre), 'es'));
        setCines({ cargando: false, error: false, lista: activos });
      })
      .catch(() => !ignorar && setCines({ cargando: false, error: true, lista: [] }));
    return () => {
      ignorar = true;
    };
  }, [esCliente]);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const primero = validarTodo();
    if (primero) {
      formRef.current?.elements.namedItem(primero)?.focus();
      return;
    }
    const datos = {
      nombre: formatoTitulo(valores.nombre),
      apellido: formatoTitulo(valores.apellido),
      ...(esCliente && {
        telefono: normalizarTelefono(valores.telefono),
        fechaNacimiento: valores.fechaNacimiento,
        genero: valores.genero,
        cinePreferidoId: Number(valores.cinePreferidoId),
      }),
    };
    setGuardando(true);
    try {
      onGuardado(await actualizarDatos(datos));
    } catch (err) {
      const porCampo = erroresPorCampo(err);
      setServidor(porCampo);
      if (!Object.keys(porCampo).length) setErrorGeneral(err.message || 'No se pudieron guardar los datos.');
      setGuardando(false);
    }
  };

  const props = (campo, normalizar) => ({
    name: campo,
    value: valores[campo],
    onChange: (e) => cambiar(campo, campo === 'telefono' ? limitarTelefono(e.target.value) : e.target.value),
    onBlur: () => salir(campo, normalizar),
    className: 'form-input',
  });

  return (
    <form ref={formRef} className={styles.formulario} onSubmit={enviar} noValidate>
      <div className={styles.dosColumnas}>
        <CampoCuenta id="cuenta-nombre" etiqueta="Nombre" error={error('nombre')}>
          {(a11y) => <input {...a11y} {...props('nombre', titulo)} type="text" autoComplete="given-name" maxLength={50} />}
        </CampoCuenta>
        <CampoCuenta id="cuenta-apellido" etiqueta="Apellido" error={error('apellido')}>
          {(a11y) => <input {...a11y} {...props('apellido', titulo)} type="text" autoComplete="family-name" maxLength={50} />}
        </CampoCuenta>
      </div>

      {esCliente && (
        <>
          <CampoCuenta id="cuenta-telefono" etiqueta="Número de teléfono" error={error('telefono')} ayuda="Con código de área y sin el 15.">
            {(a11y) => (
              <input
                {...a11y}
                {...props('telefono', (v) => (normalizarTelefono(v) ? formatearTelefono(normalizarTelefono(v)) : v))}
                type="tel"
                autoComplete="tel-national"
                inputMode="tel"
                maxLength={20}
                placeholder="11 4000 1000"
              />
            )}
          </CampoCuenta>
          <CampoCuenta id="cuenta-fecha" etiqueta="Fecha de nacimiento" error={error('fechaNacimiento')}>
            {(a11y) => <input {...a11y} {...props('fechaNacimiento')} type="date" autoComplete="bday" max={fechaMaximaNacimientoISO()} min="1900-01-01" />}
          </CampoCuenta>
          <CampoCuenta id="cuenta-genero" etiqueta="Género" error={error('genero')}>
            {(a11y) => (
              <select {...a11y} {...props('genero')}>
                <option value="">Elegí una opción</option>
                {GENEROS.map((g) => (
                  <option key={g.valor} value={g.valor}>
                    {g.texto}
                  </option>
                ))}
              </select>
            )}
          </CampoCuenta>
          <CampoCuenta
            id="cuenta-cine"
            etiqueta="Complejo de preferencia"
            error={error('cinePreferidoId') || (cines.error ? 'No pudimos cargar los complejos.' : undefined)}
          >
            {(a11y) => (
              <select {...a11y} {...props('cinePreferidoId')} disabled={cines.cargando || cines.error}>
                <option value="">{cines.cargando ? 'Cargando complejos…' : 'Elegí un complejo'}</option>
                {cines.lista.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nombreCine(c.nombre)}
                  </option>
                ))}
              </select>
            )}
          </CampoCuenta>
        </>
      )}

      {errorGeneral && (
        <p className="form-error" role="alert" data-icono="error">
          {errorGeneral}
        </p>
      )}
      <AccionesEdicion guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}
