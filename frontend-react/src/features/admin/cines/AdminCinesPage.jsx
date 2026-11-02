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
import { useToast } from '../../../components/ui/useToast';
import { BARRIOS_CABA, PROVINCIAS } from '../../../lib/catalogos';
import { nombreCine } from '../../../lib/formato';
import { clave, formatearTelefono, formatoTitulo, normalizarTelefono, texto } from '../../../lib/normalizar';
import { adminCines } from '../../../services/admin';
import FotoCine from '../../cines/FotoCine';
import { direccionCine, ubicacionCine } from '../../cines/cines';

const ID_FORM = 'form-cine';
// Opcional: una URL completa (https://...) o una ruta del sitio (/img/cines/abasto.jpg)
const FORMATO_IMAGEN = /^(https?:\/\/\S+|\/\S*)$/;

const VACIO = { nombre: '', provincia: 'CABA', localidad: '', calle: '', altura: '', telefono: '', urlImagen: '' };

const aFormulario = (c) => ({
  nombre: c.nombre ?? '',
  provincia: c.provincia ?? '',
  localidad: c.localidad ?? '',
  calle: c.calle ?? '',
  altura: c.altura == null ? '' : String(c.altura),
  telefono: formatearTelefono(c.telefono),
  urlImagen: c.urlImagen ?? '',
});

// Lo que viaja al backend, con las mismas normalizaciones que aplica el servicio
const aDatos = (v) => ({
  nombre: formatoTitulo(v.nombre),
  provincia: v.provincia,
  localidad: v.provincia === 'CABA' ? v.localidad : formatoTitulo(v.localidad),
  calle: texto(v.calle),
  altura: Number(v.altura),
  telefono: normalizarTelefono(v.telefono) ?? null,
  urlImagen: texto(v.urlImagen),
});

export default function AdminCinesPage() {
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(adminCines.listar);
  const cines = listado.datos ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');

  const validar = (v, idPropio = edicion.item?.id) => {
    const errores = {};
    if (!texto(v.nombre)) errores.nombre = 'Completá el nombre';
    else if (cines.some((c) => c.id !== idPropio && clave(c.nombre) === clave(formatoTitulo(v.nombre)))) {
      errores.nombre = 'Ya existe un cine con ese nombre';
    }
    if (!v.provincia) errores.provincia = 'Elegí la provincia';
    if (!texto(v.localidad)) errores.localidad = v.provincia === 'CABA' ? 'Elegí el barrio' : 'Completá la localidad';
    else if (v.provincia === 'CABA' && !BARRIOS_CABA.includes(v.localidad)) errores.localidad = 'Elegí un barrio de la lista';
    if (!texto(v.calle)) errores.calle = 'Completá la calle';
    if (!String(v.altura).trim()) errores.altura = 'Completá la altura';
    else if (!/^\d{1,5}$/.test(String(v.altura).trim()) || Number(v.altura) < 1) errores.altura = 'Tiene que ser un número entero mayor a 0';
    if (normalizarTelefono(v.telefono) === undefined) errores.telefono = 'Tiene que tener 10 dígitos con el código de área (por ejemplo, 011-4000-1000)';
    if (texto(v.urlImagen) && !FORMATO_IMAGEN.test(texto(v.urlImagen))) errores.urlImagen = 'Tiene que empezar con http://, https:// o /';
    return errores;
  };

  const edicion = useEdicion({
    vacio: VACIO,
    aFormulario,
    validar: (v) => validar(v),
    confirmar,
    guardar: (v, item) => (item ? adminCines.modificar(item.id, aDatos(v)) : adminCines.crear(aDatos(v))),
    onGuardado: () => {
      mostrarAviso('Cine guardado', 'exito');
      listado.recargar();
    },
  });
  const { valores, errores } = edicion;

  const cambiarEstado = async (cine, activo) => {
    try {
      await adminCines.cambiarEstado(cine.id, activo);
      mostrarAviso(activo ? `${nombreCine(cine.nombre)} está activo y visible en el sitio` : `${nombreCine(cine.nombre)} desactivado: ya no aparece en el sitio`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo cambiar el estado. Intentá de nuevo.', 'error');
    }
  };

  const eliminar = useEliminacion({
    confirmar,
    mostrarAviso,
    nombreDe: (c) => nombreCine(c.nombre),
    eliminar: (c) => adminCines.eliminar(c.id),
    textoEliminado: 'Cine eliminado',
    onCambio: listado.recargar,
    alternativa: (c, asociados) =>
      c.activo
        ? {
            mensaje: `${nombreCine(c.nombre)} tiene ${asociados} asociadas. Podés desactivarlo para que deje de aparecer en el sitio; sus compras siguen visibles en Mis compras.`,
            textoConfirmar: 'Desactivar',
            textoListo: `${nombreCine(c.nombre)} desactivado: ya no aparece en el sitio`,
            accion: () => adminCines.cambiarEstado(c.id, false),
          }
        : { mensaje: `${nombreCine(c.nombre)} tiene ${asociados} asociadas. Ya está inactivo, así que no aparece en el sitio.` },
  });

  const filtrados = cines.filter((c) => cumpleEstado(c.activo, estado) && clave(c.nombre).includes(clave(busqueda)));

  // Las props comunes de cada control: valor, cambio y validacion al salir del campo
  const props = (campo) => ({
    value: valores[campo],
    onChange: (e) => edicion.cambiar(campo, e.target.value),
    onBlur: () => edicion.tocar(campo),
  });

  return (
    <>
      <PaginaGestion
        titulo="Cines"
        textoAgregar="Agregar cine"
        onAgregar={() => edicion.abrir()}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por nombre"
        estado={estado}
        onEstado={setEstado}
        carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
        total={cines.length}
        cantidad={filtrados.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'cine' : 'cines'}`}
        vacio={{ titulo: 'Todavía no hay cines', mensaje: 'Agregá el primero para empezar a cargar salas y funciones.' }}
      >
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Foto</span>
              </th>
              <th scope="col">Nombre</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Dirección</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className={c.activo ? '' : styles.filaInactiva}>
                <td>
                  <FotoCine cine={c} className={styles.miniatura} />
                </td>
                <td className={styles.principal}>{c.nombre}</td>
                <td className={styles.nowrap}>{ubicacionCine(c) || <SinDato />}</td>
                <td className={styles.nowrap}>{direccionCine(c) || <SinDato />}</td>
                <td className={styles.numero}>{c.telefono ? formatearTelefono(c.telefono) : <SinDato />}</td>
                <td>
                  <BadgeEstado activo={c.activo} />
                </td>
                <td>
                  <div className={styles.acciones}>
                    <BotonIcono etiqueta={`Editar ${nombreCine(c.nombre)}`} onClick={() => edicion.abrir(c)}>
                      <IconoEditar />
                    </BotonIcono>
                    {c.activo ? (
                      <BotonIcono etiqueta={`Desactivar ${nombreCine(c.nombre)}`} onClick={() => cambiarEstado(c, false)}>
                        <IconoDesactivar />
                      </BotonIcono>
                    ) : (
                      <BotonIcono etiqueta={`Activar ${nombreCine(c.nombre)}`} onClick={() => cambiarEstado(c, true)}>
                        <IconoActivar />
                      </BotonIcono>
                    )}
                    <BotonIcono etiqueta={`Eliminar ${nombreCine(c.nombre)}`} peligro onClick={() => eliminar(c)}>
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
        titulo={edicion.item ? `Editar ${nombreCine(edicion.item.nombre)}` : 'Nuevo cine'}
        onCerrar={edicion.cerrar}
        pie={<PieFormulario idFormulario={ID_FORM} guardando={edicion.guardando} onCancelar={edicion.cerrar} />}
      >
        <form id={ID_FORM} className={styles.formulario} onSubmit={edicion.enviar} noValidate>
          {edicion.errorGeneral && (
            <p className={styles.errorGeneral} role="alert" data-icono="error">
              {edicion.errorGeneral}
            </p>
          )}

          <Campo id="campo-nombre" etiqueta="Nombre" ayuda='Por ejemplo, "CineClick Abasto".' error={errores.nombre}>
            {(a11y) => <input type="text" maxLength={120} autoComplete="off" {...a11y} {...props('nombre')} />}
          </Campo>

          <Campo id="campo-provincia" etiqueta="Provincia" error={errores.provincia}>
            {(a11y) => (
              <select
                {...a11y}
                value={valores.provincia}
                onBlur={() => edicion.tocar('provincia')}
                onChange={(e) => {
                  const provincia = e.target.value;
                  // Al pasar de CABA a otra provincia (o al reves) la localidad elegida deja de servir
                  const sigueValida = provincia === 'CABA' ? BARRIOS_CABA.includes(valores.localidad) : valores.provincia !== 'CABA';
                  edicion.cambiar({ provincia, localidad: sigueValida ? valores.localidad : '' });
                }}
              >
                <option value="">Elegí una provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.texto}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          {valores.provincia === 'CABA' ? (
            <Campo id="campo-localidad" etiqueta="Barrio" error={errores.localidad}>
              {(a11y) => (
                <select {...a11y} {...props('localidad')}>
                  <option value="">Elegí un barrio</option>
                  {BARRIOS_CABA.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          ) : (
            <Campo id="campo-localidad" etiqueta="Localidad" ayuda='Por ejemplo, "San Isidro".' error={errores.localidad}>
              {(a11y) => <input type="text" maxLength={80} {...a11y} {...props('localidad')} />}
            </Campo>
          )}

          <div className={`${styles.fila} ${styles.filaCalle}`}>
            <Campo id="campo-calle" etiqueta="Calle" error={errores.calle}>
              {(a11y) => <input type="text" maxLength={120} autoComplete="off" {...a11y} {...props('calle')} />}
            </Campo>
            <Campo id="campo-altura" etiqueta="Altura" error={errores.altura}>
              {(a11y) => <input type="text" inputMode="numeric" maxLength={5} autoComplete="off" {...a11y} {...props('altura')} />}
            </Campo>
          </div>

          <Campo id="campo-telefono" etiqueta="Teléfono" opcional ayuda="Con código de área. Podés escribirlo en cualquier formato." error={errores.telefono}>
            {(a11y) => (
              <input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                {...a11y}
                value={valores.telefono}
                onChange={(e) => edicion.cambiar('telefono', e.target.value)}
                onBlur={() => {
                  // Si es valido se muestra ya normalizado, como va a quedar guardado
                  const digitos = normalizarTelefono(valores.telefono);
                  if (digitos) edicion.cambiar('telefono', formatearTelefono(digitos));
                  edicion.tocar('telefono');
                }}
              />
            )}
          </Campo>

          <div className={styles.vistaPrevia}>
            <Campo
              id="campo-urlImagen"
              etiqueta="Foto (URL o ruta)"
              opcional
              ayuda="Si queda vacía o no carga, se muestra el nombre del cine."
              error={errores.urlImagen}
            >
              {(a11y) => <input type="text" placeholder="/img/cines/abasto.jpg o https://…" {...a11y} {...props('urlImagen')} />}
            </Campo>
            {/* key: al cambiar la URL se vuelve a intentar cargar la vista previa */}
            <FotoCine
              key={valores.urlImagen}
              cine={{ nombre: valores.nombre || 'Sin foto', urlImagen: texto(valores.urlImagen) }}
              className={styles.fotoPrevia}
              cargaDiferida={false}
            />
          </div>
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
