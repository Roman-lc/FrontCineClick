import { useState } from 'react';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import BotonIcono from '../../../components/admin/BotonIcono';
import Campo from '../../../components/admin/Campo';
import Drawer from '../../../components/admin/Drawer';
import { IconoActivar, IconoDesactivar, IconoEditar, IconoEliminar } from '../../../components/admin/Iconos';
import PaginaGestion, { SinDato } from '../../../components/admin/PaginaGestion';
import { cumpleEstado } from '../../../components/admin/filtros';
import PieFormulario from '../../../components/admin/PieFormulario';
import { useConfirmacion } from '../../../components/admin/useConfirmacion';
import { useEdicion } from '../../../components/admin/useEdicion';
import { useEliminacion } from '../../../components/admin/useEliminacion';
import { useListado } from '../../../components/admin/useListado';
import styles from '../../../components/admin/admin.module.css';
import Poster from '../../../components/ui/Poster';
import { useToast } from '../../../components/ui/ToastProvider';
import { CLASIFICACIONES, FORMATOS_FUNCION, GENEROS, IDIOMAS } from '../../../lib/catalogos';
import { fechaCorta } from '../../../lib/fechas';
import { etiquetaClasificacion, etiquetaFormato, etiquetaGenero, etiquetaIdioma, formatearDuracion } from '../../../lib/formato';
import { clave, texto } from '../../../lib/normalizar';
import { adminPeliculas } from '../../../services/admin';

const ID_FORM = 'form-pelicula';
const FORMATO_URL = /^(https?:\/\/\S+|\/\S*)$/;

const VACIO = {
  titulo: '',
  sinopsis: '',
  duracionMinutos: '',
  clasificacion: '',
  genero: '',
  idioma: '',
  formatosDisponibles: ['DOS_D'],
  fechaEstreno: '',
  urlPoster: '',
  destacada: false,
};

const aFormulario = (p) => ({
  titulo: p.titulo ?? '',
  sinopsis: p.sinopsis ?? '',
  duracionMinutos: String(p.duracionMinutos ?? ''),
  clasificacion: p.clasificacion ?? '',
  genero: p.genero ?? '',
  idioma: p.idioma ?? '',
  formatosDisponibles: FORMATOS_FUNCION.map((f) => f.valor).filter((f) => p.formatosDisponibles?.includes(f)),
  fechaEstreno: p.fechaEstreno ?? '',
  urlPoster: p.urlPoster ?? '',
  destacada: Boolean(p.destacada),
});

// El titulo no cambia de mayusculas: solo se limpian los espacios
const aDatos = (v) => ({
  titulo: texto(v.titulo),
  sinopsis: texto(v.sinopsis),
  duracionMinutos: Number(v.duracionMinutos),
  clasificacion: v.clasificacion,
  genero: v.genero,
  idioma: v.idioma,
  formatosDisponibles: v.formatosDisponibles,
  fechaEstreno: v.fechaEstreno || null,
  urlPoster: texto(v.urlPoster),
  destacada: v.destacada,
});

function validar(v) {
  const errores = {};
  if (!texto(v.titulo)) errores.titulo = 'Completá el título';
  if (!texto(v.sinopsis)) errores.sinopsis = 'Completá la sinopsis';
  const duracion = String(v.duracionMinutos).trim();
  if (!duracion) errores.duracionMinutos = 'Completá la duración';
  else if (!/^\d+$/.test(duracion) || Number(duracion) < 1 || Number(duracion) > 600) errores.duracionMinutos = 'Tiene que durar entre 1 y 600 minutos';
  if (!v.clasificacion) errores.clasificacion = 'Elegí la calificación';
  if (!v.genero) errores.genero = 'Elegí el género';
  if (!v.idioma) errores.idioma = 'Elegí el idioma';
  if (!v.formatosDisponibles.length) errores.formatosDisponibles = 'Elegí al menos un formato';
  if (texto(v.urlPoster) && !FORMATO_URL.test(texto(v.urlPoster))) errores.urlPoster = 'Tiene que empezar con http://, https:// o /';
  return errores;
}

export default function AdminPeliculasPage() {
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(adminPeliculas.listar);
  const peliculas = listado.datos ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');

  const edicion = useEdicion({
    vacio: VACIO,
    aFormulario,
    validar,
    confirmar,
    guardar: (v, item) => (item ? adminPeliculas.modificar(item.id, aDatos(v)) : adminPeliculas.crear(aDatos(v))),
    onGuardado: () => {
      mostrarAviso('Película guardada', 'exito');
      listado.recargar();
    },
  });
  const { valores, errores } = edicion;

  const cambiarEstado = async (pelicula, activa) => {
    try {
      await adminPeliculas.cambiarEstado(pelicula.id, activa);
      mostrarAviso(activa ? `${pelicula.titulo} está activa y visible en el sitio` : `${pelicula.titulo} desactivada: ya no aparece en el sitio`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo cambiar el estado. Intentá de nuevo.', 'error');
    }
  };

  const eliminar = useEliminacion({
    confirmar,
    mostrarAviso,
    nombreDe: (p) => p.titulo,
    eliminar: (p) => adminPeliculas.eliminar(p.id),
    textoEliminado: 'Película eliminada',
    onCambio: listado.recargar,
    alternativa: (p, asociados) =>
      p.activa
        ? {
            mensaje: `${p.titulo} tiene ${asociados} asociadas. Podés desactivarla para que deje de aparecer en el sitio.`,
            textoConfirmar: 'Desactivar',
            textoListo: `${p.titulo} desactivada: ya no aparece en el sitio`,
            accion: () => adminPeliculas.cambiarEstado(p.id, false),
          }
        : { mensaje: `${p.titulo} tiene ${asociados} asociadas. Ya está inactiva, así que no aparece en el sitio.` },
  });

  const filtradas = peliculas.filter((p) => cumpleEstado(p.activa, estado) && clave(p.titulo).includes(clave(busqueda)));

  const props = (campo) => ({
    value: valores[campo],
    onChange: (e) => edicion.cambiar(campo, e.target.value),
    onBlur: () => edicion.tocar(campo),
  });

  const opciones = (catalogo, vacio) => [
    <option key="" value="">
      {vacio}
    </option>,
    ...catalogo.map((c) => (
      <option key={c.valor} value={c.valor}>
        {c.completo ? `${c.texto} · ${c.completo}` : c.texto}
      </option>
    )),
  ];

  const alternarFormato = (formato, marcado) => {
    const elegidos = new Set(valores.formatosDisponibles);
    if (marcado) elegidos.add(formato);
    else elegidos.delete(formato);
    edicion.cambiar('formatosDisponibles', FORMATOS_FUNCION.map((f) => f.valor).filter((f) => elegidos.has(f)));
  };

  return (
    <>
      <PaginaGestion
        titulo="Películas"
        textoAgregar="Agregar película"
        onAgregar={() => edicion.abrir()}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por título"
        estado={estado}
        onEstado={setEstado}
        opcionesEstado={[
          { valor: 'activos', texto: 'Activas' },
          { valor: 'inactivos', texto: 'Inactivas' },
          { valor: 'todos', texto: 'Todas' },
        ]}
        carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
        total={peliculas.length}
        cantidad={filtradas.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'película' : 'películas'}`}
        vacio={{ titulo: 'Todavía no hay películas', mensaje: 'Agregá la primera para poder programar funciones.' }}
      >
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Póster</span>
              </th>
              <th scope="col">Título</th>
              <th scope="col">Género</th>
              <th scope="col">Duración</th>
              <th scope="col">Calificación</th>
              <th scope="col">Idioma</th>
              <th scope="col">Formatos</th>
              <th scope="col">Estreno</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => (
              <tr key={p.id} className={p.activa ? '' : styles.filaInactiva}>
                <td>
                  <Poster pelicula={p} className={styles.miniaturaPoster} />
                </td>
                <td>
                  <span className={styles.principal}>{p.titulo}</span>
                  {p.destacada && <span className={styles.secundario}>Destacada</span>}
                </td>
                <td className={styles.nowrap}>{etiquetaGenero(p.genero)}</td>
                <td className={styles.numero}>{formatearDuracion(p.duracionMinutos)}</td>
                <td>{etiquetaClasificacion(p.clasificacion)}</td>
                <td>{etiquetaIdioma(p.idioma)}</td>
                <td className={styles.nowrap}>{(p.formatosDisponibles ?? []).map(etiquetaFormato).join(' · ')}</td>
                <td className={styles.numero}>{p.fechaEstreno ? fechaCorta(p.fechaEstreno) + '/' + p.fechaEstreno.slice(0, 4) : <SinDato />}</td>
                <td>
                  <BadgeEstado activo={p.activa} texto={p.activa ? 'Activa' : 'Inactiva'} />
                </td>
                <td>
                  <div className={styles.acciones}>
                    <BotonIcono etiqueta={`Editar ${p.titulo}`} onClick={() => edicion.abrir(p)}>
                      <IconoEditar />
                    </BotonIcono>
                    {p.activa ? (
                      <BotonIcono etiqueta={`Desactivar ${p.titulo}`} onClick={() => cambiarEstado(p, false)}>
                        <IconoDesactivar />
                      </BotonIcono>
                    ) : (
                      <BotonIcono etiqueta={`Activar ${p.titulo}`} onClick={() => cambiarEstado(p, true)}>
                        <IconoActivar />
                      </BotonIcono>
                    )}
                    <BotonIcono etiqueta={`Eliminar ${p.titulo}`} peligro onClick={() => eliminar(p)}>
                      <IconoEliminar />
                    </BotonIcono>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PaginaGestion>

      <Drawer
        abierto={edicion.abierto}
        titulo={edicion.item ? `Editar ${edicion.item.titulo}` : 'Nueva película'}
        onCerrar={edicion.cerrar}
        pie={<PieFormulario idFormulario={ID_FORM} guardando={edicion.guardando} onCancelar={edicion.cerrar} />}
      >
        <form id={ID_FORM} className={styles.formulario} onSubmit={edicion.enviar} noValidate>
          {edicion.errorGeneral && (
            <p className={styles.errorGeneral} role="alert" data-icono="error">
              {edicion.errorGeneral}
            </p>
          )}

          <Campo id="campo-titulo" etiqueta="Título" error={errores.titulo}>
            {(a11y) => <input type="text" maxLength={120} autoComplete="off" {...a11y} {...props('titulo')} />}
          </Campo>

          <Campo id="campo-sinopsis" etiqueta="Sinopsis" error={errores.sinopsis}>
            {(a11y) => <textarea maxLength={1200} rows={4} {...a11y} {...props('sinopsis')} />}
          </Campo>

          <div className={styles.fila}>
            <Campo id="campo-duracionMinutos" etiqueta="Duración (minutos)" ayuda="Entre 1 y 600." error={errores.duracionMinutos}>
              {(a11y) => <input type="text" inputMode="numeric" maxLength={3} autoComplete="off" {...a11y} {...props('duracionMinutos')} />}
            </Campo>
            <Campo id="campo-fechaEstreno" etiqueta="Estreno" opcional error={errores.fechaEstreno}>
              {(a11y) => <input type="date" {...a11y} {...props('fechaEstreno')} />}
            </Campo>
          </div>

          <div className={styles.fila}>
            <Campo id="campo-genero" etiqueta="Género" error={errores.genero}>
              {(a11y) => (
                <select {...a11y} {...props('genero')}>
                  {opciones(GENEROS, 'Elegí el género')}
                </select>
              )}
            </Campo>
            <Campo id="campo-idioma" etiqueta="Idioma" error={errores.idioma}>
              {(a11y) => (
                <select {...a11y} {...props('idioma')}>
                  {opciones(IDIOMAS, 'Elegí el idioma')}
                </select>
              )}
            </Campo>
          </div>

          <Campo id="campo-clasificacion" etiqueta="Calificación" error={errores.clasificacion}>
            {(a11y) => (
              <select {...a11y} {...props('clasificacion')}>
                {opciones(CLASIFICACIONES, 'Elegí la calificación')}
              </select>
            )}
          </Campo>

          <fieldset className={styles.campo} aria-describedby={errores.formatosDisponibles ? 'formatos-error' : undefined}>
            <legend className={styles.etiqueta}>Formatos disponibles</legend>
            <div className={styles.casillas}>
              {FORMATOS_FUNCION.map((f, i) => (
                <label key={f.valor} className={styles.casilla}>
                  <input
                    type="checkbox"
                    id={i === 0 ? 'campo-formatosDisponibles' : undefined}
                    checked={valores.formatosDisponibles.includes(f.valor)}
                    onChange={(e) => alternarFormato(f.valor, e.target.checked)}
                  />
                  {f.texto}
                </label>
              ))}
            </div>
            {errores.formatosDisponibles && (
              <p id="formatos-error" className={styles.error} data-icono="error">
                {errores.formatosDisponibles}
              </p>
            )}
          </fieldset>

          <div className={styles.vistaPrevia}>
            <Campo id="campo-urlPoster" etiqueta="Póster (URL o ruta)" opcional ayuda="Si queda vacío o no carga, se muestra el título." error={errores.urlPoster}>
              {(a11y) => <input type="text" placeholder="https://…" {...a11y} {...props('urlPoster')} />}
            </Campo>
            <Poster key={valores.urlPoster} pelicula={{ titulo: valores.titulo || 'Sin póster', urlPoster: texto(valores.urlPoster) }} className={styles.posterPrevio} cargaDiferida={false} />
          </div>

          <label className={styles.casilla}>
            <input type="checkbox" checked={valores.destacada} onChange={(e) => edicion.cambiar('destacada', e.target.checked)} />
            Destacada en la cartelera
          </label>
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
