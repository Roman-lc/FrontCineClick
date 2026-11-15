import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCuenta } from '../../services/cuenta';
import { useAuth } from '../../app/useAuth';
import { useToast } from '../../components/ui/useToast';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import EstadoError from '../../components/ui/EstadoError';
import SeccionDatos from './SeccionDatos';
import SeccionEmail from './SeccionEmail';
import SeccionContrasena from './SeccionContrasena';
import SeccionComunicaciones from './SeccionComunicaciones';
import SeccionPrivacidad from './SeccionPrivacidad';
import { useCambiosSinGuardar } from './useCambiosSinGuardar';
import styles from './miCuenta.module.css';

const SECCIONES = [
  { id: 'datos-personales', texto: 'Datos personales' },
  { id: 'email', texto: 'Email' },
  { id: 'contrasena', texto: 'Contraseña' },
  { id: 'comunicaciones', texto: 'Comunicaciones' },
  { id: 'privacidad', texto: 'Privacidad' },
];

const DESCARTAR = {
  titulo: 'Tenés cambios sin guardar',
  mensaje: 'Si editás otra sección, se pierden los cambios que no guardaste en esta.',
  textoConfirmar: 'Descartar cambios',
  textoCancelar: 'Seguir editando',
};

function mesYAnio(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
}

export default function CuentaPage() {
  const { actualizarSesion } = useAuth();
  const { mostrarAviso } = useToast();
  const location = useLocation();
  const [cuenta, setCuenta] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  const [editando, setEditando] = useState(null);
  const [sucio, setSucio] = useState(false);
  const [confirmar, dialogoConfirmar] = useConfirmacion();

  useCambiosSinGuardar(sucio, confirmar);

  useEffect(() => {
    let ignorar = false;
    getCuenta()
      .then((datos) => {
        if (ignorar) return;
        setCuenta(datos);
        setError(null);
        actualizarSesion(datos);
      })
      .catch((err) => !ignorar && setError(err));
    return () => {
      ignorar = true;
    };
  }, [intento, actualizarSesion]);

  useEffect(() => {
    if (cuenta && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [cuenta, location.hash]);

  const editar = async (id) => {
    if (editando && editando !== id && sucio && !(await confirmar(DESCARTAR))) return;
    setSucio(false);
    setEditando(id);
  };

  const cancelar = () => {
    setSucio(false);
    setEditando(null);
  };

  const actualizar = useCallback(
    (nueva) => {
      setCuenta(nueva);
      actualizarSesion(nueva);
    },
    [actualizarSesion]
  );

  const guardado = (nueva, mensaje = 'Datos actualizados') => {
    actualizar(nueva);
    setSucio(false);
    setEditando(null);
    mostrarAviso(mensaje, 'exito');
  };

  const props = (id) => ({
    cuenta,
    editando: editando === id,
    onEditar: () => editar(id),
    onCancelar: cancelar,
    onGuardado: guardado,
    onActualizar: actualizar,
    onSucio: setSucio,
  });

  return (
    <section className="section">
      <title>Mi cuenta | CineClick</title>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Mi cuenta</h1>
        {cuenta && (
          <p className={styles.subtitulo}>
            <span className={styles.nombre}>{cuenta.nombreCompleto}</span>
            {cuenta.clienteDesde ? ` · Cliente desde ${mesYAnio(cuenta.clienteDesde)}` : cuenta.rol === 'ADMIN' ? ' · Administrador' : ''}
          </p>
        )}
      </header>

      {error && !cuenta && (
        <EstadoError titulo="No pudimos cargar tu cuenta" onReintentar={() => setIntento((n) => n + 1)} />
      )}
      {!error && !cuenta && (
        <p className="form-ayuda" role="status">
          Cargando tu cuenta…
        </p>
      )}

      {cuenta && (
        <div className={styles.distribucion}>
          <nav className={styles.indice} aria-label="Secciones de Mi cuenta">
            <ul>
              {SECCIONES.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} aria-current={location.hash === `#${s.id}` ? 'location' : undefined}>
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.secciones}>
            <SeccionDatos {...props('datos-personales')} />
            <SeccionEmail {...props('email')} />
            <SeccionContrasena {...props('contrasena')} />
            <SeccionComunicaciones cuenta={cuenta} onActualizar={actualizar} />
            <SeccionPrivacidad cuenta={cuenta} />
          </div>
        </div>
      )}
      {dialogoConfirmar}
    </section>
  );
}
