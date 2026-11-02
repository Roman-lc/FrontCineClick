import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import BotonIcono from '../../../components/admin/BotonIcono';
import Campo from '../../../components/admin/Campo';
import Drawer from '../../../components/admin/Drawer';
import { IconoCancelar, IconoEditar, IconoEliminar } from '../../../components/admin/Iconos';
import PaginaGestion from '../../../components/admin/PaginaGestion';
import PieFormulario from '../../../components/admin/PieFormulario';
import { useConfirmacion } from '../../../components/admin/useConfirmacion';
import { useEdicion } from '../../../components/admin/useEdicion';
import { useEliminacion } from '../../../components/admin/useEliminacion';
import { useListado } from '../../../components/admin/useListado';
import styles from '../../../components/admin/admin.module.css';
import { useToast } from '../../../components/ui/useToast';
import { FORMATOS_FUNCION, IDIOMAS } from '../../../lib/catalogos';
import { ahoraParaInput, fechaFuncionCorta, horaCorta } from '../../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, formatearPrecio, nombreCine } from '../../../lib/formato';
import { clave } from '../../../lib/normalizar';
import { adminCines, adminFunciones, adminPeliculas, adminSalas } from '../../../services/admin';

const ID_FORM = 'form-funcion';
// Igual que cineclick.funciones.minutos-limpieza en el backend (que es quien decide)
const MINUTOS_LIMPIEZA = 20;
const PRECIO = /^\d{1,8}([.,]\d{1,2})?$/;

const VACIO = { peliculaId: '', cineId: '', salaId: '', fechaHoraInicio: '', formato: '', idioma: '', precioBase: '' };

const ESTADOS = [
  { valor: 'proximas', texto: 'Próximas' },
  { valor: 'pasadas', texto: 'Pasadas' },
  { valor: 'canceladas', texto: 'Canceladas' },
  { valor: 'todos', texto: 'Todas' },
];

const POR_PAGINA = 100;
const yaEmpezo = (f) => new Date(f.fechaHoraInicio) <= new Date();

function estadoDe(f) {
  if (f.estado === 'CANCELADA') return { texto: 'Cancelada', activo: false };
  if (f.estado === 'FINALIZADA' || yaEmpezo(f)) return { texto: 'Finalizada', activo: false };
  if (f.estado === 'AGOTADA' || f.butacasLibres === 0) return { texto: 'Agotada', activo: true };
  return { texto: 'Programada', activo: true };
}

function cumpleFiltro(f, filtro) {
  if (filtro === 'canceladas') return f.estado === 'CANCELADA';
  if (filtro === 'pasadas') return f.estado !== 'CANCELADA' && yaEmpezo(f);
  if (filtro === 'proximas') return f.estado !== 'CANCELADA' && !yaEmpezo(f);
  return true;
}

const cargar = () =>
  Promise.all([adminFunciones.listar(), adminPeliculas.listar(), adminCines.listar(), adminSalas.listar()]).then(
    ([funciones, peliculas, cines, salas]) => ({ funciones, peliculas, cines, salas })
  );

export default function AdminFuncionesPage() {
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(cargar);
  const [params, setParams] = useSearchParams();
  const { funciones = [], peliculas = [], cines = [], salas = [] } = listado.datos ?? {};
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('proximas');
  const [cineFiltro, setCineFiltro] = useState('');
  // Con miles de funciones (las pasadas incluidas) la tabla se dibuja de a POR_PAGINA filas; con otro filtro vuelve a empezar
  const [mostradas, setMostradas] = useState({ filtro: '', cantidad: POR_PAGINA });

  const peliculaDe = (id) => peliculas.find((p) => String(p.id) === String(id));

  // Fin estimado: duracion de la pelicula mas el margen de limpieza
  const finDe = (v) => {
    const pelicula = peliculaDe(v.peliculaId);
    if (!pelicula || !v.fechaHoraInicio) return null;
    return new Date(new Date(v.fechaHoraInicio).getTime() + (pelicula.duracionMinutos + MINUTOS_LIMPIEZA) * 60000);
  };

  const validar = (v) => {
    const errores = {};
    const pelicula = peliculaDe(v.peliculaId);
    if (!v.peliculaId) errores.peliculaId = 'Elegí la película';
    if (!v.cineId) errores.cineId = 'Elegí el cine';
    if (!v.salaId) errores.salaId = 'Elegí la sala';
    if (!v.fechaHoraInicio) errores.fechaHoraInicio = 'Completá la fecha y la hora';
    else if (new Date(v.fechaHoraInicio) <= new Date()) errores.fechaHoraInicio = 'La función tiene que ser en el futuro';
    else if (pelicula && v.salaId) {
      const inicio = new Date(v.fechaHoraInicio);
      const fin = finDe(v);
      const choque = funciones.find(
        (f) =>
          String(f.salaId) === v.salaId &&
          f.id !== edicion.item?.id &&
          f.estado !== 'CANCELADA' &&
          inicio < new Date(f.fechaHoraFin) &&
          fin > new Date(f.fechaHoraInicio)
      );
      if (choque) {
        errores.fechaHoraInicio = `Se superpone con ${choque.peliculaTitulo} (${horaCorta(choque.fechaHoraInicio)} a ${horaCorta(choque.fechaHoraFin)}, con limpieza) en esta sala`;
      }
    }
    if (!v.formato) errores.formato = 'Elegí el formato';
    else if (pelicula && !pelicula.formatosDisponibles.includes(v.formato)) errores.formato = 'La película no está disponible en ese formato';
    if (!v.idioma) errores.idioma = 'Elegí el idioma';
    const precio = String(v.precioBase).trim();
    if (!precio) errores.precioBase = 'Completá el precio';
    else if (!PRECIO.test(precio) || Number(precio.replace(',', '.')) <= 0) errores.precioBase = 'Tiene que ser mayor a 0, con hasta 2 decimales';
    return errores;
  };

  const edicion = useEdicion({
    vacio: VACIO,
    aFormulario: (f) => ({
      peliculaId: String(f.peliculaId),
      cineId: String(f.cineId),
      salaId: String(f.salaId),
      fechaHoraInicio: f.fechaHoraInicio.slice(0, 16),
      formato: f.formato,
      idioma: f.idioma,
      precioBase: String(f.precioBase),
    }),
    validar: (v) => validar(v),
    confirmar,
    guardar: (v, item) => {
      const datos = {
        peliculaId: Number(v.peliculaId),
        salaId: Number(v.salaId),
        fechaHoraInicio: `${v.fechaHoraInicio}:00`,
        formato: v.formato,
        idioma: v.idioma,
        precioBase: Number(String(v.precioBase).replace(',', '.')),
      };
      return item ? adminFunciones.modificar(item.id, datos) : adminFunciones.crear(datos);
    },
    onGuardado: () => {
      mostrarAviso('Función guardada', 'exito');
      listado.recargar();
    },
  });
  const { valores, errores } = edicion;

  // Llegando con ?funcion=ID (desde las metricas) se abre el detalle de esa funcion una sola vez
  const funcionPedida = params.get('funcion');
  useEffect(() => {
    if (!funcionPedida || !listado.datos) return;
    const funcion = listado.datos.funciones.find((f) => String(f.id) === funcionPedida);
    setParams({}, { replace: true });
    if (funcion) edicion.abrir(funcion);
    // edicion.abrir cambia en cada render: solo interesa reaccionar al pedido y a la carga
  }, [funcionPedida, listado.datos]); // eslint-disable-line react-hooks/exhaustive-deps

  const nombreFuncion = (f) => `la función de ${f.peliculaTitulo} del ${fechaFuncionCorta(f.fechaHoraInicio)}`;

  const cancelar = async (f) => {
    const seguro = await confirmar({
      titulo: `¿Cancelar ${nombreFuncion(f)}?`,
      mensaje: 'Deja de estar a la venta. Si ya tiene entradas vendidas, figuran como canceladas en Mis compras.',
      textoConfirmar: 'Cancelar función',
      textoCancelar: 'Volver',
      peligro: true,
    });
    if (!seguro) return;
    try {
      await adminFunciones.cancelar(f.id);
      mostrarAviso('Función cancelada', 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo cancelar la función. Intentá de nuevo.', 'error');
    }
  };

  const eliminar = useEliminacion({
    confirmar,
    mostrarAviso,
    nombreDe: nombreFuncion,
    eliminar: (f) => adminFunciones.eliminar(f.id),
    textoEliminado: 'Función eliminada',
    onCambio: listado.recargar,
    alternativa: (f, asociados) =>
      f.estado !== 'CANCELADA' && !yaEmpezo(f)
        ? {
            mensaje: `La función tiene ${asociados} asociadas. Podés cancelarla para que deje de estar a la venta.`,
            textoConfirmar: 'Cancelar función',
            textoListo: 'Función cancelada',
            accion: () => adminFunciones.cancelar(f.id),
          }
        : { mensaje: `La función tiene ${asociados} asociadas, así que se conserva para el historial de compras.` },
  });

  const filtradas = funciones
    .filter((f) => cumpleFiltro(f, estado) && (!cineFiltro || String(f.cineId) === cineFiltro) && clave(f.peliculaTitulo).includes(clave(busqueda)))
    .sort((a, b) => (estado === 'pasadas' ? b.fechaHoraInicio.localeCompare(a.fechaHoraInicio) : a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)));
  const filtroActual = `${estado}|${cineFiltro}|${busqueda}`;
  const limite = mostradas.filtro === filtroActual ? mostradas.cantidad : POR_PAGINA;
  const visibles = filtradas.slice(0, limite);

  const props = (campo) => ({
    value: valores[campo],
    onChange: (e) => edicion.cambiar(campo, e.target.value),
    onBlur: () => edicion.tocar(campo),
  });

  const pelicula = peliculaDe(valores.peliculaId);
  const peliculasElegibles = peliculas.filter((p) => p.activa || String(p.id) === valores.peliculaId);
  const cinesElegibles = cines.filter((c) => c.activo || String(c.id) === valores.cineId);
  const salasDelCine = salas.filter((s) => String(s.cineId) === valores.cineId && (s.activa || String(s.id) === valores.salaId));
  const formatos = FORMATOS_FUNCION.filter((f) => !pelicula || pelicula.formatosDisponibles.includes(f.valor));
  const fin = finDe(valores);

  return (
    <>
      <PaginaGestion
        titulo="Funciones"
        textoAgregar="Agregar función"
        onAgregar={() => edicion.abrir()}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por película"
        estado={estado}
        onEstado={setEstado}
        opcionesEstado={ESTADOS}
        filtrosExtra={
          <select className={`${styles.control} ${styles.filtroSelect}`} aria-label="Filtrar por cine" value={cineFiltro} onChange={(e) => setCineFiltro(e.target.value)}>
            <option value="">Todos los cines</option>
            {cines.map((c) => (
              <option key={c.id} value={c.id}>
                {nombreCine(c.nombre)}
              </option>
            ))}
          </select>
        }
        carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
        total={funciones.length}
        cantidad={filtradas.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'función' : 'funciones'}`}
        vacio={{ titulo: 'Todavía no hay funciones', mensaje: 'Programá la primera eligiendo película, sala y horario.' }}
      >
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Película</th>
              <th scope="col">Función</th>
              <th scope="col">Cine · Sala</th>
              <th scope="col">Precio</th>
              <th scope="col">Vendidas</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((f) => {
              const est = estadoDe(f);
              const editable = f.estado !== 'CANCELADA' && !yaEmpezo(f);
              return (
                <tr key={f.id} className={est.activo ? '' : styles.filaInactiva}>
                  <td>
                    <span className={styles.principal}>{f.peliculaTitulo}</span>
                    <span className={styles.secundario}>
                      {etiquetaFormato(f.formato)} · {etiquetaIdioma(f.idioma)}
                    </span>
                  </td>
                  <td className={styles.nowrap}>
                    {fechaFuncionCorta(f.fechaHoraInicio)}
                    <span className={styles.secundario}>Termina {horaCorta(f.fechaHoraFin)}</span>
                  </td>
                  <td className={styles.nowrap}>
                    {nombreCine(f.cineNombre)} · {f.salaNombre}
                  </td>
                  <td className={styles.numero}>{formatearPrecio(f.precioBase)}</td>
                  <td className={styles.numero}>
                    {f.capacidadSala - f.butacasLibres} / {f.capacidadSala}
                  </td>
                  <td>
                    <BadgeEstado activo={est.activo} texto={est.texto} />
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      {editable && (
                        <BotonIcono etiqueta={`Editar ${nombreFuncion(f)}`} onClick={() => edicion.abrir(f)}>
                          <IconoEditar />
                        </BotonIcono>
                      )}
                      {editable && (
                        <BotonIcono etiqueta={`Cancelar ${nombreFuncion(f)}`} onClick={() => cancelar(f)}>
                          <IconoCancelar />
                        </BotonIcono>
                      )}
                      <BotonIcono etiqueta={`Eliminar ${nombreFuncion(f)}`} peligro onClick={() => eliminar(f)}>
                        <IconoEliminar />
                      </BotonIcono>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtradas.length > limite && (
          <div className={styles.verMas}>
            <span>
              Mostrando {limite} de {filtradas.length}
            </span>
            <button type="button" className="btn btn-sm" onClick={() => setMostradas({ filtro: filtroActual, cantidad: limite + POR_PAGINA })}>
              Mostrar {Math.min(POR_PAGINA, filtradas.length - limite)} más
            </button>
          </div>
        )}
      </PaginaGestion>

      <Drawer
        abierto={edicion.abierto}
        titulo={edicion.item ? `Editar función de ${edicion.item.peliculaTitulo}` : 'Nueva función'}
        onCerrar={edicion.cerrar}
        pie={<PieFormulario idFormulario={ID_FORM} guardando={edicion.guardando} onCancelar={edicion.cerrar} />}
      >
        <form id={ID_FORM} className={styles.formulario} onSubmit={edicion.enviar} noValidate>
          {edicion.errorGeneral && (
            <p className={styles.errorGeneral} role="alert" data-icono="error">
              {edicion.errorGeneral}
            </p>
          )}

          <Campo id="campo-peliculaId" etiqueta="Película" error={errores.peliculaId}>
            {(a11y) => (
              <select
                {...a11y}
                value={valores.peliculaId}
                onBlur={() => edicion.tocar('peliculaId')}
                onChange={(e) => {
                  const elegida = peliculaDe(e.target.value);
                  // Formato e idioma se proponen segun la pelicula (se pueden cambiar)
                  edicion.cambiar({
                    peliculaId: e.target.value,
                    formato: elegida?.formatosDisponibles.includes(valores.formato) ? valores.formato : (elegida?.formatosDisponibles[0] ?? ''),
                    idioma: valores.idioma || (elegida?.idioma ?? ''),
                  });
                }}
              >
                <option value="">Elegí la película</option>
                {peliculasElegibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          <div className={styles.fila}>
            <Campo id="campo-cineId" etiqueta="Cine" error={errores.cineId}>
              {(a11y) => (
                <select
                  {...a11y}
                  value={valores.cineId}
                  onBlur={() => edicion.tocar('cineId')}
                  onChange={(e) => edicion.cambiar({ cineId: e.target.value, salaId: '' })}
                >
                  <option value="">Elegí el cine</option>
                  {cinesElegibles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {nombreCine(c.nombre)}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo id="campo-salaId" etiqueta="Sala" ayuda={!valores.cineId ? 'Primero elegí el cine.' : undefined} error={errores.salaId}>
              {(a11y) => (
                <select {...a11y} {...props('salaId')} disabled={!valores.cineId}>
                  <option value="">Elegí la sala</option>
                  {salasDelCine.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.capacidad} butacas)
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          </div>

          <Campo
            id="campo-fechaHoraInicio"
            etiqueta="Fecha y hora"
            ayuda={fin ? `Termina a las ${horaCorta(fin.toISOString())} (incluye ${MINUTOS_LIMPIEZA} min de limpieza de la sala).` : undefined}
            error={errores.fechaHoraInicio}
          >
            {(a11y) => <input type="datetime-local" min={ahoraParaInput()} step={300} {...a11y} {...props('fechaHoraInicio')} />}
          </Campo>

          <div className={styles.fila}>
            <Campo id="campo-formato" etiqueta="Formato" error={errores.formato}>
              {(a11y) => (
                <select {...a11y} {...props('formato')}>
                  <option value="">Elegí el formato</option>
                  {formatos.map((f) => (
                    <option key={f.valor} value={f.valor}>
                      {f.texto}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo id="campo-idioma" etiqueta="Idioma" error={errores.idioma}>
              {(a11y) => (
                <select {...a11y} {...props('idioma')}>
                  <option value="">Elegí el idioma</option>
                  {IDIOMAS.map((i) => (
                    <option key={i.valor} value={i.valor}>
                      {i.texto}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          </div>

          <Campo id="campo-precioBase" etiqueta="Precio de la entrada general" ayuda="En pesos. Menores y jubilados pagan con descuento sobre este precio." error={errores.precioBase}>
            {(a11y) => <input type="text" inputMode="decimal" autoComplete="off" placeholder="4200" {...a11y} {...props('precioBase')} />}
          </Campo>
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
