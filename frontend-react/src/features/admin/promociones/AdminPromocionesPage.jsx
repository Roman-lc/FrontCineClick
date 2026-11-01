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
import { useToast } from '../../../components/ui/ToastProvider';
import { fechaCorta, hoyISO } from '../../../lib/fechas';
import { clave, texto } from '../../../lib/normalizar';
import { adminPromociones } from '../../../services/admin';

const ID_FORM = 'form-promocion';
const PORCENTAJE = /^\d{1,3}([.,]\d{1,2})?$/;

const VACIO = { codigo: '', titulo: '', descripcion: '', porcentajeDescuento: '', fechaInicio: '', fechaFin: '', activa: true };

const aFormulario = (p) => ({
  codigo: p.codigo ?? '',
  titulo: p.titulo ?? '',
  descripcion: p.descripcion ?? '',
  porcentajeDescuento: String(Number(p.porcentajeDescuento ?? 0)),
  fechaInicio: p.fechaInicio ?? '',
  fechaFin: p.fechaFin ?? '',
  activa: p.activa !== false,
});

const aDatos = (v) => ({
  codigo: v.codigo.trim().toUpperCase(),
  titulo: texto(v.titulo),
  descripcion: texto(v.descripcion),
  porcentajeDescuento: Number(String(v.porcentajeDescuento).replace(',', '.')),
  fechaInicio: v.fechaInicio,
  fechaFin: v.fechaFin,
  activa: v.activa,
});

// '2026-11-01' -> '01/11/2026'
const fecha = (iso) => `${fechaCorta(iso)}/${iso.slice(0, 4)}`;

function vigencia(p) {
  const hoy = hoyISO();
  if (!p.activa) return { texto: 'Inactiva', activo: false };
  if (p.fechaFin < hoy) return { texto: 'Vencida', activo: false };
  if (p.fechaInicio > hoy) return { texto: 'Programada', activo: true };
  return { texto: 'Vigente', activo: true };
}

export default function AdminPromocionesPage() {
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(adminPromociones.listar);
  const promociones = listado.datos ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');

  const validar = (v) => {
    const errores = {};
    const codigo = v.codigo.trim().toUpperCase();
    if (!codigo) errores.codigo = 'Completá el código';
    else if (!/^[A-Z0-9]+$/.test(codigo)) errores.codigo = 'Solo letras y números, sin espacios';
    else if (promociones.some((p) => p.id !== edicion.item?.id && p.codigo.toUpperCase() === codigo)) errores.codigo = 'Ya existe una promoción con ese código';
    if (!texto(v.descripcion)) errores.descripcion = 'Completá las condiciones';
    const porcentaje = String(v.porcentajeDescuento).trim();
    const numero = Number(porcentaje.replace(',', '.'));
    if (!porcentaje) errores.porcentajeDescuento = 'Completá el descuento';
    else if (!PORCENTAJE.test(porcentaje) || numero <= 0 || numero > 100) errores.porcentajeDescuento = 'Entre 0,01 y 100, con hasta 2 decimales';
    if (!v.fechaInicio) errores.fechaInicio = 'Completá la fecha de inicio';
    if (!v.fechaFin) errores.fechaFin = 'Completá la fecha de fin';
    else if (v.fechaInicio && v.fechaFin < v.fechaInicio) errores.fechaFin = 'No puede ser anterior a la fecha de inicio';
    return errores;
  };

  const edicion = useEdicion({
    vacio: VACIO,
    aFormulario,
    validar: (v) => validar(v),
    confirmar,
    guardar: (v, item) => (item ? adminPromociones.modificar(item.id, aDatos(v)) : adminPromociones.crear(aDatos(v))),
    onGuardado: () => {
      mostrarAviso('Promoción guardada', 'exito');
      listado.recargar();
    },
  });
  const { valores, errores } = edicion;

  const cambiarEstado = async (promo, activa) => {
    try {
      await adminPromociones.cambiarEstado(promo.id, activa);
      mostrarAviso(activa ? `${promo.codigo} activada` : `${promo.codigo} desactivada: ya no se puede usar`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo cambiar el estado. Intentá de nuevo.', 'error');
    }
  };

  const eliminar = useEliminacion({
    confirmar,
    mostrarAviso,
    nombreDe: (p) => p.codigo,
    eliminar: (p) => adminPromociones.eliminar(p.id),
    textoEliminado: 'Promoción eliminada',
    onCambio: listado.recargar,
    alternativa: (p, asociados) =>
      p.activa
        ? {
            mensaje: `${p.codigo} tiene ${asociados} asociadas. Podés desactivarla para que deje de aparecer en el sitio y no se pueda usar más.`,
            textoConfirmar: 'Desactivar',
            textoListo: `${p.codigo} desactivada: ya no se puede usar`,
            accion: () => adminPromociones.cambiarEstado(p.id, false),
          }
        : { mensaje: `${p.codigo} tiene ${asociados} asociadas. Ya está inactiva, así que no se puede usar.` },
  });

  const filtradas = promociones.filter(
    (p) => cumpleEstado(p.activa, estado) && (clave(p.codigo).includes(clave(busqueda)) || clave(p.titulo).includes(clave(busqueda)))
  );

  const props = (campo) => ({
    value: valores[campo],
    onChange: (e) => edicion.cambiar(campo, e.target.value),
    onBlur: () => edicion.tocar(campo),
  });

  return (
    <>
      <PaginaGestion
        titulo="Promociones"
        textoAgregar="Agregar promoción"
        onAgregar={() => edicion.abrir()}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por código o título"
        estado={estado}
        onEstado={setEstado}
        opcionesEstado={[
          { valor: 'activos', texto: 'Activas' },
          { valor: 'inactivos', texto: 'Inactivas' },
          { valor: 'todos', texto: 'Todas' },
        ]}
        carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
        total={promociones.length}
        cantidad={filtradas.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'promoción' : 'promociones'}`}
        vacio={{ titulo: 'Todavía no hay promociones', mensaje: 'Creá un código de descuento para ofrecer en el sitio.' }}
      >
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Título</th>
              <th scope="col">Descuento</th>
              <th scope="col">Vigencia</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => {
              const est = vigencia(p);
              return (
                <tr key={p.id} className={est.activo ? '' : styles.filaInactiva}>
                  <td className={styles.codigo}>{p.codigo}</td>
                  <td>
                    {p.titulo || <SinDato />}
                    <span className={styles.secundario}>{p.descripcion}</span>
                  </td>
                  <td className={styles.numero}>{Number(p.porcentajeDescuento).toLocaleString('es-AR')}%</td>
                  <td className={styles.numero}>
                    {fecha(p.fechaInicio)} al {fecha(p.fechaFin)}
                  </td>
                  <td>
                    <BadgeEstado activo={est.activo} texto={est.texto} />
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      <BotonIcono etiqueta={`Editar ${p.codigo}`} onClick={() => edicion.abrir(p)}>
                        <IconoEditar />
                      </BotonIcono>
                      {p.activa ? (
                        <BotonIcono etiqueta={`Desactivar ${p.codigo}`} onClick={() => cambiarEstado(p, false)}>
                          <IconoDesactivar />
                        </BotonIcono>
                      ) : (
                        <BotonIcono etiqueta={`Activar ${p.codigo}`} onClick={() => cambiarEstado(p, true)}>
                          <IconoActivar />
                        </BotonIcono>
                      )}
                      <BotonIcono etiqueta={`Eliminar ${p.codigo}`} peligro onClick={() => eliminar(p)}>
                        <IconoEliminar />
                      </BotonIcono>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PaginaGestion>

      <Drawer
        abierto={edicion.abierto}
        titulo={edicion.item ? `Editar ${edicion.item.codigo}` : 'Nueva promoción'}
        onCerrar={edicion.cerrar}
        pie={<PieFormulario idFormulario={ID_FORM} guardando={edicion.guardando} onCancelar={edicion.cerrar} />}
      >
        <form id={ID_FORM} className={styles.formulario} onSubmit={edicion.enviar} noValidate>
          {edicion.errorGeneral && (
            <p className={styles.errorGeneral} role="alert" data-icono="error">
              {edicion.errorGeneral}
            </p>
          )}

          <div className={styles.fila}>
            <Campo id="campo-codigo" etiqueta="Código" ayuda="Letras y números. Se guarda en mayúsculas." error={errores.codigo}>
              {(a11y) => (
                <input
                  type="text"
                  maxLength={40}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  {...a11y}
                  value={valores.codigo}
                  onChange={(e) => edicion.cambiar('codigo', e.target.value.toUpperCase())}
                  onBlur={() => edicion.tocar('codigo')}
                />
              )}
            </Campo>
            <Campo id="campo-porcentajeDescuento" etiqueta="Descuento (%)" error={errores.porcentajeDescuento}>
              {(a11y) => <input type="text" inputMode="decimal" autoComplete="off" placeholder="10" {...a11y} {...props('porcentajeDescuento')} />}
            </Campo>
          </div>

          <Campo id="campo-titulo" etiqueta="Título" opcional ayuda='Corto, para la tarjeta del sitio: "Estrenos online".' error={errores.titulo}>
            {(a11y) => <input type="text" maxLength={60} autoComplete="off" {...a11y} {...props('titulo')} />}
          </Campo>

          <Campo id="campo-descripcion" etiqueta="Condiciones" error={errores.descripcion}>
            {(a11y) => <textarea maxLength={200} rows={3} {...a11y} {...props('descripcion')} />}
          </Campo>

          <div className={styles.fila}>
            <Campo id="campo-fechaInicio" etiqueta="Desde" error={errores.fechaInicio}>
              {(a11y) => <input type="date" {...a11y} {...props('fechaInicio')} />}
            </Campo>
            <Campo id="campo-fechaFin" etiqueta="Hasta" error={errores.fechaFin}>
              {(a11y) => <input type="date" min={valores.fechaInicio || undefined} {...a11y} {...props('fechaFin')} />}
            </Campo>
          </div>

          <label className={styles.casilla}>
            <input type="checkbox" checked={valores.activa} onChange={(e) => edicion.cambiar('activa', e.target.checked)} />
            Activa (se puede usar dentro de las fechas)
          </label>
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
