import { useState } from 'react';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import BotonIcono from '../../../components/admin/BotonIcono';
import Campo from '../../../components/admin/Campo';
import Drawer from '../../../components/admin/Drawer';
import { IconoActivar, IconoDesactivar, IconoEditar, IconoEliminar } from '../../../components/admin/Iconos';
import PaginaGestion from '../../../components/admin/PaginaGestion';
import { cumpleEstado } from '../../../components/admin/filtros';
import PieFormulario from '../../../components/admin/PieFormulario';
import { useConfirmacion } from '../../../components/admin/useConfirmacion';
import { useEdicion } from '../../../components/admin/useEdicion';
import { useEliminacion } from '../../../components/admin/useEliminacion';
import { useListado } from '../../../components/admin/useListado';
import styles from '../../../components/admin/admin.module.css';
import { useToast } from '../../../components/ui/ToastProvider';
import { TIPOS_SALA, itemDe } from '../../../lib/catalogos';
import { nombreCine } from '../../../lib/formato';
import { clave, texto } from '../../../lib/normalizar';
import { adminCines, adminSalas } from '../../../services/admin';

const ID_FORM = 'form-sala';
const VACIO = { cineId: '', nombre: '', numero: '', tipo: 'TRADICIONAL', cantidadFilas: '', butacasPorFila: '' };

const aFormulario = (s) => ({
  cineId: String(s.cineId),
  nombre: s.nombre ?? '',
  numero: String(s.numero ?? ''),
  tipo: s.tipo ?? '',
  cantidadFilas: '',
  butacasPorFila: '',
});

const entero = (valor) => (/^\d+$/.test(String(valor).trim()) ? Number(valor) : NaN);
const cargar = () => Promise.all([adminSalas.listar(), adminCines.listar()]).then(([salas, cines]) => ({ salas, cines }));

export default function AdminSalasPage() {
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(cargar);
  const salas = listado.datos?.salas ?? [];
  const cines = listado.datos?.cines ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');
  const [cineFiltro, setCineFiltro] = useState('');

  const validar = (v) => {
    const errores = {};
    const idPropio = edicion.item?.id;
    const delCine = salas.filter((s) => String(s.cineId) === v.cineId && s.id !== idPropio);
    if (!v.cineId) errores.cineId = 'Elegí el cine';
    if (!texto(v.nombre)) errores.nombre = 'Completá el nombre';
    else if (delCine.some((s) => clave(s.nombre) === clave(v.nombre))) errores.nombre = 'Ya existe una sala con ese nombre en este cine';
    const numero = entero(v.numero);
    if (!String(v.numero).trim()) errores.numero = 'Completá el número';
    else if (!(numero >= 1)) errores.numero = 'Tiene que ser un número entero mayor a 0';
    else if (delCine.some((s) => s.numero === numero)) errores.numero = 'Ya existe una sala con ese número en este cine';
    if (!v.tipo) errores.tipo = 'Elegí el tipo de sala';
    // El plano solo se arma en el alta
    if (!edicion.item) {
      const filas = entero(v.cantidadFilas);
      const butacas = entero(v.butacasPorFila);
      if (!(filas >= 1 && filas <= 26)) errores.cantidadFilas = 'Entre 1 y 26 filas';
      if (!(butacas >= 1 && butacas <= 40)) errores.butacasPorFila = 'Entre 1 y 40 butacas';
    }
    return errores;
  };

  const edicion = useEdicion({
    vacio: VACIO,
    aFormulario,
    validar: (v) => validar(v),
    confirmar,
    guardar: (v, item) => {
      const datos = { nombre: texto(v.nombre), numero: Number(v.numero), tipo: v.tipo };
      if (item) return adminSalas.modificar(item.id, datos);
      return adminSalas.crear(v.cineId, { ...datos, cantidadFilas: Number(v.cantidadFilas), butacasPorFila: Number(v.butacasPorFila) });
    },
    onGuardado: () => {
      mostrarAviso('Sala guardada', 'exito');
      listado.recargar();
    },
  });
  const { valores, errores } = edicion;

  const nombreSala = (s) => `${s.nombre} de ${nombreCine(s.cineNombre)}`;

  const cambiarEstado = async (sala, activa) => {
    try {
      await adminSalas.cambiarEstado(sala.id, activa);
      mostrarAviso(activa ? `${nombreSala(sala)} activada` : `${nombreSala(sala)} desactivada`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo cambiar el estado. Intentá de nuevo.', 'error');
    }
  };

  const eliminar = useEliminacion({
    confirmar,
    mostrarAviso,
    nombreDe: nombreSala,
    eliminar: (s) => adminSalas.eliminar(s.id),
    textoEliminado: 'Sala eliminada',
    onCambio: listado.recargar,
    alternativa: (s, asociados) =>
      s.activa
        ? {
            mensaje: `${nombreSala(s)} tiene ${asociados} asociadas. Podés desactivarla para que no se le puedan programar funciones nuevas.`,
            textoConfirmar: 'Desactivar',
            textoListo: `${nombreSala(s)} desactivada`,
            accion: () => adminSalas.cambiarEstado(s.id, false),
          }
        : { mensaje: `${nombreSala(s)} tiene ${asociados} asociadas y ya está inactiva.` },
  });

  const filtradas = salas.filter(
    (s) => cumpleEstado(s.activa, estado) && (!cineFiltro || String(s.cineId) === cineFiltro) && clave(s.nombre).includes(clave(busqueda))
  );

  const props = (campo) => ({
    value: valores[campo],
    onChange: (e) => edicion.cambiar(campo, e.target.value),
    onBlur: () => edicion.tocar(campo),
  });
  const filas = entero(valores.cantidadFilas);
  const butacas = entero(valores.butacasPorFila);

  return (
    <>
      <PaginaGestion
        titulo="Salas"
        textoAgregar="Agregar sala"
        onAgregar={() => edicion.abrir()}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por nombre"
        estado={estado}
        onEstado={setEstado}
        opcionesEstado={[
          { valor: 'activos', texto: 'Activas' },
          { valor: 'inactivos', texto: 'Inactivas' },
          { valor: 'todos', texto: 'Todas' },
        ]}
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
        total={salas.length}
        cantidad={filtradas.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'sala' : 'salas'}`}
        vacio={{ titulo: 'Todavía no hay salas', mensaje: 'Agregá una sala a un cine para poder programar funciones.' }}
      >
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Cine</th>
              <th scope="col">Número</th>
              <th scope="col">Tipo</th>
              <th scope="col">Capacidad</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((s) => (
              <tr key={s.id} className={s.activa ? '' : styles.filaInactiva}>
                <td className={styles.principal}>{s.nombre}</td>
                <td className={styles.nowrap}>{nombreCine(s.cineNombre)}</td>
                <td className={styles.numero}>{s.numero}</td>
                <td>{itemDe(TIPOS_SALA, s.tipo).texto}</td>
                <td className={styles.numero}>{s.capacidad} butacas</td>
                <td>
                  <BadgeEstado activo={s.activa} texto={s.activa ? 'Activa' : 'Inactiva'} />
                </td>
                <td>
                  <div className={styles.acciones}>
                    <BotonIcono etiqueta={`Editar ${nombreSala(s)}`} onClick={() => edicion.abrir(s)}>
                      <IconoEditar />
                    </BotonIcono>
                    {s.activa ? (
                      <BotonIcono etiqueta={`Desactivar ${nombreSala(s)}`} onClick={() => cambiarEstado(s, false)}>
                        <IconoDesactivar />
                      </BotonIcono>
                    ) : (
                      <BotonIcono etiqueta={`Activar ${nombreSala(s)}`} onClick={() => cambiarEstado(s, true)}>
                        <IconoActivar />
                      </BotonIcono>
                    )}
                    <BotonIcono etiqueta={`Eliminar ${nombreSala(s)}`} peligro onClick={() => eliminar(s)}>
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
        titulo={edicion.item ? `Editar ${nombreSala(edicion.item)}` : 'Nueva sala'}
        onCerrar={edicion.cerrar}
        pie={<PieFormulario idFormulario={ID_FORM} guardando={edicion.guardando} onCancelar={edicion.cerrar} />}
      >
        <form id={ID_FORM} className={styles.formulario} onSubmit={edicion.enviar} noValidate>
          {edicion.errorGeneral && (
            <p className={styles.errorGeneral} role="alert" data-icono="error">
              {edicion.errorGeneral}
            </p>
          )}

          <Campo id="campo-cineId" etiqueta="Cine" ayuda={edicion.item ? 'Una sala no se puede pasar a otro cine.' : undefined} error={errores.cineId}>
            {(a11y) => (
              <select {...a11y} {...props('cineId')} disabled={Boolean(edicion.item)}>
                <option value="">Elegí un cine</option>
                {cines.map((c) => (
                  <option key={c.id} value={c.id}>
                    {nombreCine(c.nombre)}
                    {c.activo ? '' : ' (inactivo)'}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          <div className={`${styles.fila} ${styles.filaCalle}`}>
            <Campo id="campo-nombre" etiqueta="Nombre" ayuda='Por ejemplo, "Sala 3" o "Sala IMAX".' error={errores.nombre}>
              {(a11y) => <input type="text" maxLength={80} autoComplete="off" {...a11y} {...props('nombre')} />}
            </Campo>
            <Campo id="campo-numero" etiqueta="Número" error={errores.numero}>
              {(a11y) => <input type="text" inputMode="numeric" maxLength={3} autoComplete="off" {...a11y} {...props('numero')} />}
            </Campo>
          </div>

          <Campo id="campo-tipo" etiqueta="Tipo de sala" error={errores.tipo}>
            {(a11y) => (
              <select {...a11y} {...props('tipo')}>
                {TIPOS_SALA.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.texto}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          {edicion.item ? (
            <p className={styles.ayuda}>
              Capacidad: {edicion.item.capacidad} butacas. El plano de butacas no se puede cambiar después de crear la sala.
            </p>
          ) : (
            <>
              <div className={styles.fila}>
                <Campo id="campo-cantidadFilas" etiqueta="Filas" ayuda="De 1 a 26 (A a Z)." error={errores.cantidadFilas}>
                  {(a11y) => <input type="text" inputMode="numeric" maxLength={2} autoComplete="off" {...a11y} {...props('cantidadFilas')} />}
                </Campo>
                <Campo id="campo-butacasPorFila" etiqueta="Butacas por fila" ayuda="De 1 a 40." error={errores.butacasPorFila}>
                  {(a11y) => <input type="text" inputMode="numeric" maxLength={2} autoComplete="off" {...a11y} {...props('butacasPorFila')} />}
                </Campo>
              </div>
              <p className={styles.ayuda} aria-live="polite">
                {filas >= 1 && butacas >= 1 ? `Capacidad: ${filas * butacas} butacas.` : 'La capacidad se calcula con las filas y las butacas por fila.'}
              </p>
            </>
          )}
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
