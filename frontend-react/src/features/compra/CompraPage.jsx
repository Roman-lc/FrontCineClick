import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { fechaHoraCorta } from '../../lib/fechas';
import { funcionVigente } from '../../lib/fechas';
import { useToast } from '../../components/ui/ToastProvider';

function buildVolverQuery(params) {
  const q = new URLSearchParams();
  if (params.get('peliculaId')) q.set('peliculaId', params.get('peliculaId'));
  if (params.get('cineId')) q.set('cineId', params.get('cineId'));
  if (params.get('fecha')) q.set('fecha', params.get('fecha'));
  return q.toString();
}

export default function CompraPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mostrarAviso } = useToast();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [funcion, setFuncion] = useState(null);
  const [butacas, setButacas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [user, setUser] = useState(null);
  const [clienteLogueado, setClienteLogueado] = useState(null);
  const [codigoPromo, setCodigoPromo] = useState('');
  const [metodoPago, setMetodoPago] = useState('TARJETA_CREDITO');
  const [tokenPago, setTokenPago] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    setUser(u);
    if (!id) {
      setLoading(false);
      setError('ID de función no especificado');
      return;
    }
    cargarDatos(id);
  }, [id]);

  const cargarDatos = async (funcionId) => {
    setLoading(true);
    setError('');
    try {
      const f = await api.get(`/api/funciones/${funcionId}`);
      if (!funcionVigente(f)) throw new Error('Esta función ya no está disponible (pasada o cancelada).');
      setFuncion(f);
      const b = await api.get(`/api/funciones/${funcionId}/butacas-disponibles`);
      setButacas(b || []);
      setLoading(false);
      verificarLogin();
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const verificarLogin = async () => {
    const u = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (!u) {
      setClienteLogueado({ sinSesion: true });
      return;
    }
    if (u.rol === 'ADMIN') {
      setClienteLogueado({ admin: true, email: u.email, nombre: u.nombre, rol: u.rol });
      return;
    }
    try {
      const clientes = await api.get('/api/clientes');
      const c = (clientes || []).find((x) => x.email && x.email.toLowerCase() === (u.email || '').toLowerCase());
      if (c) {
        setClienteLogueado({ clienteId: c.id, email: u.email, nombre: u.nombre || c.nombre, rol: u.rol });
      } else {
        setClienteLogueado({ sinCliente: true, email: u.email, nombre: u.nombre, rol: u.rol });
      }
    } catch {
      setClienteLogueado({ sinCliente: true, email: u.email, nombre: u.nombre, rol: u.rol });
    }
  };

  const toggleButaca = (butaca) => {
    if (butaca.disponible === false) return;
    setSeleccionadas((prev) => {
      const idx = prev.findIndex((b) => b.id === butaca.id);
      if (idx > -1) {
        return prev.filter((b) => b.id !== butaca.id);
      }
      return [...prev, butaca];
    });
  };

  const butacasPorFila = {};
  (butacas || []).forEach((b) => {
    if (!butacasPorFila[b.fila]) butacasPorFila[b.fila] = [];
    butacasPorFila[b.fila].push(b);
  });
  const filasOrdenadas = Object.keys(butacasPorFila).sort();
  Object.values(butacasPorFila).forEach((lista) => lista.sort((a, b) => a.numero - b.numero));

  const total = seleccionadas.length * (funcion ? funcion.precioBase : 0);
  const puedeComprar = user && clienteLogueado && clienteLogueado.clienteId && user.rol !== 'ADMIN' && seleccionadas.length > 0 && tokenPago.trim();

  const realizarCompra = async () => {
    if (!user) {
      mostrarAviso('Debés iniciar sesión para realizar la compra', 'error');
      navigate('/login');
      return;
    }
    if (user.rol === 'ADMIN') {
      mostrarAviso('Los administradores no pueden realizar compras', 'error');
      return;
    }
    if (!clienteLogueado || !clienteLogueado.clienteId) {
      mostrarAviso('No se encontró/creó el cliente. Probá cerrando sesión y volviendo a ingresar.', 'error');
      return;
    }
    if (seleccionadas.length === 0) {
      mostrarAviso('Por favor seleccioná al menos una butaca', 'error');
      return;
    }
    if (!tokenPago.trim()) {
      mostrarAviso('Por favor ingresá los datos de pago', 'error');
      return;
    }
    try {
      setProcesando(true);
      const compra = await api.post('/api/compras', {
        clienteId: clienteLogueado.clienteId,
        funcionId: funcion.id,
        butacasIds: seleccionadas.map((b) => b.id),
        codigoPromocion: codigoPromo.trim() || null,
      });
      const pago = await api.post(`/api/compras/${compra.id}/pagos`, {
        metodoPago,
        datosPagoToken: tokenPago.trim(),
      });
      mostrarAviso(`Compra confirmada. Compra N°: ${compra.id} · Pago N°: ${pago.id} · Estado: ${pago.estado} · Total: $${pago.montoPagado || compra.total}`, 'exito');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      mostrarAviso('Error: ' + err.message, 'error');
      setProcesando(false);
    }
  };

  const volverHref = `/funciones${buildVolverQuery(searchParams) ? '?' + buildVolverQuery(searchParams) : ''}`;

  return (
    <section className="section">
      <Link to={volverHref} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al listado</Link>
      <h2>Comprar Entradas</h2>
      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && funcion && (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><strong>Información de la Función</strong></div>
            <div className="card-body">
              <p><strong>Película:</strong> {funcion.peliculaTitulo} - {String(funcion.formato || '').replace('_', 'D')}</p>
              <p><strong>Cine/Sala:</strong> {funcion.cineNombre} | {funcion.salaNombre}</p>
              <p><strong>Fecha y Hora:</strong> {fechaHoraCorta(funcion.fechaHoraInicio)}</p>
              <p><strong>Precio base:</strong> <span style={{ color: 'var(--success)', fontWeight: 600 }}>${(funcion.precioBase || 0).toLocaleString('es-AR')}</span></p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><strong>Seleccionar Butacas</strong></div>
            <div className="card-body">
              <div className="screen" style={{ textAlign: 'center', padding: '0.5rem', background: '#e0e0e0', marginBottom: '1rem', borderRadius: '4px' }}>PANTALLA</div>
              <div className="seat-map">
                {filasOrdenadas.map((fila) => (
                  <div key={fila} className="seat-row">
                    <div className="seat-row-label">{fila}</div>
                    {butacasPorFila[fila].map((b) => {
                      const ocupada = b.disponible === false;
                      const sel = seleccionadas.some((s) => s.id === b.id);
                      return (
                        <div
                          key={b.id}
                          className={`seat ${b.tipo === 'VIP' ? 'vip' : ''} ${ocupada ? 'occupied' : ''} ${sel ? 'selected' : ''}`}
                          title={ocupada ? `${b.fila}${b.numero} - ocupada` : `${b.fila}${b.numero} - ${b.tipo}`}
                          onClick={() => toggleButaca(b)}
                        >
                          {b.numero}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="seat-legend" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div className="legend-box free" style={{ width: 20, height: 20, border: '1px solid #ccc' }}></div> Libre</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div className="legend-box selected" style={{ width: 20, height: 20, background: 'var(--info)' }}></div> Seleccionada</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div className="legend-box occupied" style={{ width: 20, height: 20, background: '#ef9a9a' }}></div> Ocupada</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div className="legend-box vip" style={{ width: 20, height: 20, border: '2px solid var(--warning)' }}></div> VIP</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><strong>Resumen de Compra</strong></div>
            <div className="card-body">
              {seleccionadas.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No hay butacas seleccionadas</p> : (
                <>
                  {seleccionadas.map((b) => (
                    <div key={b.id}>• Butaca {b.fila}{b.numero} ({b.tipo}) - ${(funcion.precioBase || 0).toLocaleString('es-AR')}</div>
                  ))}
                  <div style={{ marginTop: '0.75rem', fontWeight: 600 }}>Total: ${total.toLocaleString('es-AR')}</div>
                </>
              )}
            </div>
          </div>

          {!user && (
            <div className="card" style={{ marginBottom: '1.5rem', background: '#fff3cd' }}>
              <div className="card-body">
                <p><strong>Necesitás iniciar sesión para comprar</strong></p>
                <Link to="/login" className="btn btn-primary">Ir a Login</Link>
              </div>
            </div>
          )}
          {user && clienteLogueado && clienteLogueado.admin && (
            <div className="card" style={{ marginBottom: '1.5rem', background: '#f8d7da' }}>
              <div className="card-body"><p style={{ color: 'var(--danger)' }}>Los administradores no pueden realizar compras</p></div>
            </div>
          )}
          {user && clienteLogueado && clienteLogueado.sinCliente && !clienteLogueado.admin && (
            <div className="card" style={{ marginBottom: '1.5rem', background: '#f8d7da' }}>
              <div className="card-body"><p style={{ color: 'var(--danger)' }}>Tu cuenta no tiene perfil de cliente. Cerrá sesión y registrate desde el formulario de login.</p></div>
            </div>
          )}
          {user && clienteLogueado && clienteLogueado.clienteId && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header"><strong>Datos del Cliente</strong></div>
              <div className="card-body">
                <p>Nombre: {clienteLogueado.nombre}</p>
                <p>Email: {clienteLogueado.email}</p>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><strong>Pago</strong></div>
            <div className="card-body">
              <div className="form-group">
                <label>Código Promoción (opcional)</label>
                <input type="text" className="form-input" value={codigoPromo} onChange={(e) => setCodigoPromo(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Método de Pago *</label>
                <select className="form-input" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="MERCADO_PAGO">Mercado Pago</option>
                  <option value="EFECTIVO">Efectivo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Datos de Pago (token) *</label>
                <input type="text" className="form-input" value={tokenPago} onChange={(e) => setTokenPago(e.target.value)} placeholder="Ingresa el token de pago" />
              </div>
              <button className="btn btn-success" onClick={realizarCompra} disabled={!puedeComprar || procesando}>
                {procesando ? 'Procesando...' : puedeComprar ? 'Pagar y Confirmar Compra' : 'Pagar y Confirmar Compra'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
