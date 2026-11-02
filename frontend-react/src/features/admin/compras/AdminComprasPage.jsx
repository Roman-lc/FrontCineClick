import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import Drawer from '../../../components/admin/Drawer';
import PaginaGestion from '../../../components/admin/PaginaGestion';
import { useListado } from '../../../components/admin/useListado';
import admin from '../../../components/admin/admin.module.css';
import { fechaHoraBreve } from '../../../lib/fechas';
import { formatearPrecio, nombreCine } from '../../../lib/formato';
import { adminCines, adminCompras } from '../../../services/admin';
import DetalleCompra from './DetalleCompra';
import { ESTADOS_COMPRA } from './estados';
import styles from './compras.module.css';

const TAMANO = 20;
const FILTROS_ESTADO = [
  { valor: 'todos', texto: 'Todas' },
  { valor: 'CONFIRMADA', texto: 'Confirmadas' },
  { valor: 'PENDIENTE_PAGO', texto: 'Pendientes' },
  { valor: 'CANCELADA', texto: 'Canceladas' },
  { valor: 'ARREPENTIDA', texto: 'Arrepentidas' },
];

// Compras de todos los clientes, con filtros y paginacion del lado del backend. Tocar una fila abre el detalle
// (solo lectura). ?compra=N abre el detalle directo: lo usan los enlaces de Soporte y Arrepentimientos.
export default function AdminComprasPage() {
  const [params, setParams] = useSearchParams();
  const compraAbierta = params.get('compra');
  const cines = useListado(adminCines.listar);

  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [texto, setTexto] = useState({ codigo: '', email: '' });
  const [cine, setCine] = useState('');
  const [estado, setEstado] = useState('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(0);
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState({ cargando: true, error: false, datos: null });

  // Lo que se escribe se busca cuando se deja de tipear
  useEffect(() => {
    const espera = setTimeout(() => {
      setTexto({ codigo: codigo.trim(), email: email.trim() });
      setPagina(0);
    }, 350);
    return () => clearTimeout(espera);
  }, [codigo, email]);

  useEffect(() => {
    let ignorar = false;
    adminCompras
      .buscar({ ...texto, cineId: cine, estado: estado === 'todos' ? '' : estado, desde, hasta, pagina, tamano: TAMANO })
      .then((datos) => !ignorar && setResultado({ cargando: false, error: false, datos }))
      .catch(() => !ignorar && setResultado({ cargando: false, error: true, datos: null }));
    return () => {
      ignorar = true;
    };
  }, [texto, cine, estado, desde, hasta, pagina, intento]);

  // Cambiar un filtro vuelve a la primera pagina
  const filtrar = (cambiar) => (valor) => {
    cambiar(valor);
    setPagina(0);
  };

  const abrir = (id) => setParams({ compra: String(id) });
  const cerrar = () => setParams({});

  const datos = resultado.datos;
  const compras = datos?.contenido ?? [];
  const total = datos?.totalElementos ?? 0;
  const hayFiltros = Boolean(texto.codigo || texto.email || cine || desde || hasta || estado !== 'todos');
  const rangoInvalido = desde && hasta && hasta < desde;

  return (
    <>
      <PaginaGestion
        titulo="Compras"
        busqueda={codigo}
        onBuscar={setCodigo}
        etiquetaBusqueda="N° de compra o código de entrada"
        estado={estado}
        onEstado={filtrar(setEstado)}
        opcionesEstado={FILTROS_ESTADO}
        filtrosExtra={
          <>
            <label className={styles.filtro}>
              <span>Email del cliente</span>
              <input type="search" className={admin.control} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            </label>
            <label className={styles.filtro}>
              <span>Cine</span>
              <select className={admin.control} value={cine} onChange={(e) => filtrar(setCine)(e.target.value)}>
                <option value="">Todos</option>
                {(cines.datos ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {nombreCine(c.nombre)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.filtro}>
              <span>Comprada desde</span>
              <input type="date" className={admin.control} value={desde} max={hasta || undefined} onChange={(e) => filtrar(setDesde)(e.target.value)} />
            </label>
            <label className={styles.filtro}>
              <span>Hasta</span>
              <input
                type="date"
                className={admin.control}
                value={hasta}
                min={desde || undefined}
                onChange={(e) => filtrar(setHasta)(e.target.value)}
                aria-invalid={rangoInvalido || undefined}
              />
            </label>
          </>
        }
        carga={{
          cargando: resultado.cargando,
          error: resultado.error,
          onReintentar: () => {
            setResultado({ cargando: true, error: false, datos: null });
            setIntento((i) => i + 1);
          },
        }}
        total={hayFiltros ? Math.max(total, 1) : total}
        cantidad={total}
        textoCantidad={(n) => `${n.toLocaleString('es-AR')} ${n === 1 ? 'compra' : 'compras'}`}
        vacio={{ titulo: 'Todavía no hay compras', mensaje: 'Las compras de los clientes aparecen acá apenas se reservan.' }}
      >
        <table className={admin.tabla}>
          <thead>
            <tr>
              <th scope="col">Compra</th>
              <th scope="col">Cliente</th>
              <th scope="col">Función</th>
              <th scope="col">Entradas</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => {
              const est = ESTADOS_COMPRA[c.estado] ?? { texto: c.estado };
              return (
                <tr key={c.id} className={styles.fila} onClick={() => abrir(c.id)}>
                  <td>
                    <button type="button" className={styles.abrir} onClick={() => abrir(c.id)}>
                      N° {c.id}
                    </button>
                    <span className={admin.secundario}>{fechaHoraBreve(c.fechaCompra)}</span>
                  </td>
                  <td>
                    {c.clienteNombre}
                    <span className={admin.secundario}>{c.clienteEmail}</span>
                  </td>
                  <td>
                    <span className={admin.principal}>{c.peliculaTitulo}</span>
                    <span className={admin.secundario}>
                      {nombreCine(c.cineNombre)} · {c.salaNombre} · {fechaHoraBreve(c.fechaHoraFuncion)}
                    </span>
                  </td>
                  <td className={admin.numero}>{c.cantidadEntradas}</td>
                  <td className={admin.numero}>
                    {formatearPrecio(c.total)}
                    {c.codigoPromocion && <span className={admin.secundario}>{c.codigoPromocion}</span>}
                  </td>
                  <td>
                    <BadgeEstado activo={est.activo} texto={est.texto} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {datos?.totalPaginas > 1 && (
          <nav className={styles.paginacion} aria-label="Páginas de compras">
            <button type="button" className="btn btn-sm" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
              Anterior
            </button>
            <span aria-live="polite">
              Página {pagina + 1} de {datos.totalPaginas}
            </span>
            <button type="button" className="btn btn-sm" disabled={pagina + 1 >= datos.totalPaginas} onClick={() => setPagina((p) => p + 1)}>
              Siguiente
            </button>
          </nav>
        )}
      </PaginaGestion>

      <Drawer
        abierto={Boolean(compraAbierta)}
        titulo={`Compra N° ${compraAbierta}`}
        onCerrar={cerrar}
        pie={
          <button type="button" className="btn" onClick={cerrar}>
            Cerrar
          </button>
        }
      >
        {compraAbierta && <DetalleCompra key={compraAbierta} id={compraAbierta} />}
      </Drawer>
    </>
  );
}
