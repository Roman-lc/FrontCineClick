import { useState } from 'react';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import BotonIcono from '../../../components/admin/BotonIcono';
import Campo from '../../../components/admin/Campo';
import Drawer from '../../../components/admin/Drawer';
import { cumpleEstado } from '../../../components/admin/filtros';
import { IconoActivar, IconoDesactivar, IconoEditar, IconoEliminar } from '../../../components/admin/Iconos';
import PaginaGestion, { SinDato } from '../../../components/admin/PaginaGestion';
import PieFormulario from '../../../components/admin/PieFormulario';
import { useConfirmacion } from '../../../components/admin/useConfirmacion';
import { useEdicion } from '../../../components/admin/useEdicion';
import { useEliminacion } from '../../../components/admin/useEliminacion';
import { useListado } from '../../../components/admin/useListado';
import styles from '../../../components/admin/admin.module.css';
import { useToast } from '../../../components/ui/useToast';
import { fechaCorta, horaCorta } from '../../../lib/fechas';
import { formatearPrecio } from '../../../lib/formato';
import { clave, texto } from '../../../lib/normalizar';
import { DIAS_SEMANA, condicionesDe, diasCortos, estadoPromocion } from '../../../lib/promociones';
import { adminPromociones } from '../../../services/admin';
import propias from './promociones.module.css';

const ID_FORM = 'form-promocion';
const PORCENTAJE = /^\d{1,3}([.,]\d{1,2})?$/;
const MONTO = /^\d{1,10}([.,]\d{1,2})?$/;
const ENTERO = /^\d{1,6}$/;

const VACIO = {
  codigo: '',
  titulo: '',
  porcentajeDescuento: '',
  maxEntradasConDescuento: '',
  montoMaximoDescuento: '',
  vigenciaDesde: '',
  vigenciaHasta: '',
  diasSemana: [],
  usosMaximosTotales: '',
  usosMaximosPorUsuario: '',
  soloPrimeraCompra: false,
  descripcion: '',
  activa: true,
};

const texto0 = (n) => (n == null ? '' : String(Number(n)));
const aFormulario = (p) => ({
  codigo: p.codigo ?? '',
  titulo: p.titulo ?? '',
  porcentajeDescuento: texto0(p.porcentajeDescuento),
  maxEntradasConDescuento: texto0(p.maxEntradasConDescuento),
  montoMaximoDescuento: texto0(p.montoMaximoDescuento),
  vigenciaDesde: p.vigenciaDesde?.slice(0, 16) ?? '',
  vigenciaHasta: p.vigenciaHasta?.slice(0, 16) ?? '',
  diasSemana: p.diasSemana ?? [],
  usosMaximosTotales: texto0(p.usosMaximosTotales),
  usosMaximosPorUsuario: texto0(p.usosMaximosPorUsuario),
  soloPrimeraCompra: Boolean(p.soloPrimeraCompra),
  descripcion: p.descripcion ?? '',
  activa: p.activa !== false,
});

const numero = (valor) => (String(valor).trim() ? Number(String(valor).replace(',', '.')) : null);

// Lo que viaja al backend. Ningun dia elegido = todos los dias (lista vacia).
const aDatos = (v) => ({
  codigo: v.codigo.trim().toUpperCase(),
  titulo: texto(v.titulo),
  descripcion: texto(v.descripcion),
  porcentajeDescuento: numero(v.porcentajeDescuento),
  vigenciaDesde: `${v.vigenciaDesde}:00`,
  vigenciaHasta: `${v.vigenciaHasta}:59`,
  diasSemana: v.diasSemana.length === 7 ? [] : v.diasSemana,
  usosMaximosTotales: numero(v.usosMaximosTotales),
  usosMaximosPorUsuario: numero(v.usosMaximosPorUsuario),
  soloPrimeraCompra: v.soloPrimeraCompra,
  maxEntradasConDescuento: numero(v.maxEntradasConDescuento),
  montoMaximoDescuento: numero(v.montoMaximoDescuento),
  activa: v.activa,
});

// "01/11 00:00"
const fechaHora = (iso) => `${fechaCorta(iso.slice(0, 10))} ${horaCorta(iso)}`;

const ATAJOS = [
  { texto: 'Todos los días', dias: [] },
  { texto: 'Lunes a viernes', dias: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
  { texto: 'Fin de semana', dias: ['SATURDAY', 'SUNDAY'] },
];

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
    const porcentaje = String(v.porcentajeDescuento).trim();
    if (!porcentaje) errores.porcentajeDescuento = 'Completá el descuento';
    else if (!PORCENTAJE.test(porcentaje) || numero(porcentaje) < 1 || numero(porcentaje) > 100) errores.porcentajeDescuento = 'Entre 1 y 100, con hasta 2 decimales';
    if (String(v.maxEntradasConDescuento).trim() && (!ENTERO.test(v.maxEntradasConDescuento.trim()) || numero(v.maxEntradasConDescuento) < 1)) {
      errores.maxEntradasConDescuento = 'Tiene que ser un número entero mayor a 0';
    }
    if (String(v.montoMaximoDescuento).trim() && (!MONTO.test(v.montoMaximoDescuento.trim()) || numero(v.montoMaximoDescuento) <= 0)) {
      errores.montoMaximoDescuento = 'Tiene que ser mayor a 0, con hasta 2 decimales';
    }
    if (!v.vigenciaDesde) errores.vigenciaDesde = 'Completá desde cuándo vale';
    if (!v.vigenciaHasta) errores.vigenciaHasta = 'Completá hasta cuándo vale';
    else if (v.vigenciaDesde && v.vigenciaHasta <= v.vigenciaDesde) errores.vigenciaHasta = 'Tiene que ser posterior al inicio';
    for (const campo of ['usosMaximosTotales', 'usosMaximosPorUsuario']) {
      if (String(v[campo]).trim() && (!ENTERO.test(v[campo].trim()) || numero(v[campo]) < 1)) errores[campo] = 'Tiene que ser un número entero mayor a 0';
    }
    const usados = edicion.item?.usosActuales ?? 0;
    if (!errores.usosMaximosTotales && String(v.usosMaximosTotales).trim() && numero(v.usosMaximosTotales) < usados) {
      errores.usosMaximosTotales = `No puede ser menor que los usos que ya tuvo (${usados})`;
    }
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

  const alternarDia = (dia) => {
    const elegidos = new Set(valores.diasSemana);
    if (elegidos.has(dia)) elegidos.delete(dia);
    else elegidos.add(dia);
    edicion.cambiar('diasSemana', DIAS_SEMANA.map((d) => d.valor).filter((d) => elegidos.has(d)));
  };

  // Vista previa con los mismos textos que la tarjeta publica
  const previa = {
    ...aDatos({ ...valores, vigenciaDesde: valores.vigenciaDesde || '2000-01-01T00:00', vigenciaHasta: valores.vigenciaHasta || '2000-01-01T00:00' }),
    usosActuales: edicion.item?.usosActuales ?? 0,
  };
  const sinTope = numero(valores.porcentajeDescuento) >= 50 && !String(valores.maxEntradasConDescuento).trim();

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
              <th scope="col">Beneficio</th>
              <th scope="col">Vigencia</th>
              <th scope="col">Días</th>
              <th scope="col">Usos</th>
              <th scope="col">Estado</th>
              <th scope="col" className={styles.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => {
              const est = estadoPromocion(p);
              const limites = [
                p.maxEntradasConDescuento && `${p.maxEntradasConDescuento} ${p.maxEntradasConDescuento === 1 ? 'entrada' : 'entradas'}`,
                p.montoMaximoDescuento && `tope ${formatearPrecio(p.montoMaximoDescuento)}`,
              ].filter(Boolean);
              return (
                <tr key={p.id} className={est === 'Activa' || est === 'Programada' ? '' : styles.filaInactiva}>
                  <td>
                    <span className={styles.codigo}>{p.codigo}</span>
                    {p.titulo ? <span className={styles.secundario}>{p.titulo}</span> : null}
                  </td>
                  <td>
                    <span className={styles.principal}>{Number(p.porcentajeDescuento).toLocaleString('es-AR')}%</span>
                    {limites.length > 0 && <span className={styles.secundario}>{limites.join(' · ')}</span>}
                  </td>
                  <td className={styles.numero}>
                    {fechaHora(p.vigenciaDesde)}
                    <span className={styles.secundario}>al {fechaHora(p.vigenciaHasta)}</span>
                  </td>
                  <td className={styles.nowrap}>{diasCortos(p.diasSemana)}</td>
                  <td className={styles.numero}>
                    {p.usosActuales} / {p.usosMaximosTotales ?? 'sin tope'}
                  </td>
                  <td>
                    <BadgeEstado activo={est === 'Activa'} texto={est} />
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

          <fieldset className={propias.seccion}>
            <legend className={propias.seccionTitulo}>1. Beneficio</legend>
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
              <Campo id="campo-porcentajeDescuento" etiqueta="Descuento (%)" ayuda="Entre 1 y 100." error={errores.porcentajeDescuento}>
                {(a11y) => <input type="text" inputMode="decimal" autoComplete="off" placeholder="10" {...a11y} {...props('porcentajeDescuento')} />}
              </Campo>
            </div>
            <Campo id="campo-titulo" etiqueta="Título" opcional ayuda='Corto, para la tarjeta del sitio: "Estrenos online".' error={errores.titulo}>
              {(a11y) => <input type="text" maxLength={60} autoComplete="off" {...a11y} {...props('titulo')} />}
            </Campo>
            <div className={styles.fila}>
              <Campo id="campo-maxEntradasConDescuento" etiqueta="Máximo de entradas con descuento" opcional ayuda="Se aplica a las de mayor precio." error={errores.maxEntradasConDescuento}>
                {(a11y) => <input type="text" inputMode="numeric" autoComplete="off" {...a11y} {...props('maxEntradasConDescuento')} />}
              </Campo>
              <Campo id="campo-montoMaximoDescuento" etiqueta="Monto máximo de descuento ($)" opcional error={errores.montoMaximoDescuento}>
                {(a11y) => <input type="text" inputMode="decimal" autoComplete="off" {...a11y} {...props('montoMaximoDescuento')} />}
              </Campo>
            </div>
            {sinTope && (
              <p className={propias.advertencia}>Sin tope de entradas, una compra de 10 entradas tendría 10 descuentos.</p>
            )}
          </fieldset>

          <fieldset className={propias.seccion}>
            <legend className={propias.seccionTitulo}>2. Vigencia</legend>
            <div className={styles.fila}>
              <Campo id="campo-vigenciaDesde" etiqueta="Desde" error={errores.vigenciaDesde}>
                {(a11y) => <input type="datetime-local" {...a11y} {...props('vigenciaDesde')} />}
              </Campo>
              <Campo id="campo-vigenciaHasta" etiqueta="Hasta" error={errores.vigenciaHasta}>
                {(a11y) => <input type="datetime-local" min={valores.vigenciaDesde || undefined} {...a11y} {...props('vigenciaHasta')} />}
              </Campo>
            </div>
          </fieldset>

          <fieldset className={propias.seccion}>
            <legend className={propias.seccionTitulo}>3. Días</legend>
            <p className={styles.ayuda}>Se comparan con el día de la función. Sin días elegidos, vale todos los días.</p>
            <div className={propias.chips} role="group" aria-label="Días de la semana">
              {DIAS_SEMANA.map((d) => (
                <button key={d.valor} type="button" className={propias.chip} aria-pressed={valores.diasSemana.includes(d.valor)} aria-label={d.plural} onClick={() => alternarDia(d.valor)}>
                  {d.corto}
                </button>
              ))}
            </div>
            <div className={propias.atajos}>
              {ATAJOS.map((a) => (
                <button key={a.texto} type="button" className="btn btn-sm" onClick={() => edicion.cambiar('diasSemana', a.dias)}>
                  {a.texto}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={propias.seccion}>
            <legend className={propias.seccionTitulo}>4. Límites</legend>
            <div className={styles.fila}>
              <Campo
                id="campo-usosMaximosTotales"
                etiqueta="Usos totales"
                opcional
                ayuda={edicion.item ? `Ya se usó ${edicion.item.usosActuales} ${edicion.item.usosActuales === 1 ? 'vez' : 'veces'}.` : 'Se cuentan al pagar.'}
                error={errores.usosMaximosTotales}
              >
                {(a11y) => <input type="text" inputMode="numeric" autoComplete="off" {...a11y} {...props('usosMaximosTotales')} />}
              </Campo>
              <Campo id="campo-usosMaximosPorUsuario" etiqueta="Usos por usuario" opcional error={errores.usosMaximosPorUsuario}>
                {(a11y) => <input type="text" inputMode="numeric" autoComplete="off" {...a11y} {...props('usosMaximosPorUsuario')} />}
              </Campo>
            </div>
            <label className={styles.casilla}>
              <input type="checkbox" checked={valores.soloPrimeraCompra} onChange={(e) => edicion.cambiar('soloPrimeraCompra', e.target.checked)} />
              Solo para la primera compra del usuario
            </label>
          </fieldset>

          <fieldset className={propias.seccion}>
            <legend className={propias.seccionTitulo}>5. Aclaraciones</legend>
            <Campo id="campo-descripcion" etiqueta="Notas adicionales" opcional ayuda="Se muestran debajo de las condiciones." error={errores.descripcion}>
              {(a11y) => <textarea maxLength={200} rows={2} {...a11y} {...props('descripcion')} />}
            </Campo>
            <label className={styles.casilla}>
              <input type="checkbox" checked={valores.activa} onChange={(e) => edicion.cambiar('activa', e.target.checked)} />
              Activa (se puede usar dentro de la vigencia)
            </label>
          </fieldset>

          <section className={propias.seccion} aria-labelledby="titulo-previa">
            <h3 id="titulo-previa" className={propias.seccionTitulo}>
              6. Vista previa
            </h3>
            <div className={propias.previa}>
              <p className={propias.previaBeneficio}>
                {numero(valores.porcentajeDescuento) ? `${numero(valores.porcentajeDescuento).toLocaleString('es-AR')}%` : '—'} de descuento
              </p>
              <p className={propias.previaTitulo}>{texto(valores.titulo) || (valores.codigo ? `Código ${valores.codigo}` : <SinDato />)}</p>
              <p className={propias.previaCondiciones}>{condicionesDe(previa)}.</p>
              {texto(valores.descripcion) && <p className={propias.previaCondiciones}>{texto(valores.descripcion)}</p>}
            </div>
          </section>
        </form>
      </Drawer>
      {dialogo}
    </>
  );
}
