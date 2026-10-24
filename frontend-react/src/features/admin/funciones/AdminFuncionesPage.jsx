import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminFuncionesPage() {
  const { mostrarAviso, confirmar } = useToast();
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cines, setCines] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ peliculaId: '', cineId: '', salaId: '', fechaHoraInicio: '', fechaHoraFin: '', precioBase: '', idioma: 'ES', formato: 'DOS_D', estado: 'ACTIVA' });

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    setError('');
    try {
      const [f, p, c, s] = await Promise.all([
        api.get('/api/funciones'),
        api.get('/api/peliculas'),
        api.get('/api/cines'),
        api.get('/api/salas')
      ]);
      setFunciones(f || []);
      setPeliculas(p || []);
      setCines(c || []);
      setSalas(s || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const salasPorCine = salas.filter(s => String(s.cineId) === String(form.cineId));

  const abrir = (f = null) => {
    if (f) {
      setEditando(f);
      setForm({
        peliculaId: f.peliculaId || '',
        cineId: f.cineId || '',
        salaId: f.salaId || '',
        fechaHoraInicio: f.fechaHoraInicio ? f.fechaHoraInicio.substring(0, 16) : '',
        fechaHoraFin: f.fechaHoraFin ? f.fechaHoraFin.substring(0, 16) : '',
        precioBase: f.precioBase || '',
        idioma: f.idioma || 'ES',
        formato: f.formato || 'DOS_D',
        estado: f.estado || 'ACTIVA'
      });
    } else {
      setEditando(null);
      setForm({ peliculaId: '', cineId: '', salaId: '', fechaHoraInicio: '', fechaHoraFin: '', precioBase: '', idioma: 'ES', formato: 'DOS_D', estado: 'ACTIVA' });
    }
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const body = {
        peliculaId: Number(form.peliculaId),
        salaId: Number(form.salaId),
        fechaHoraInicio: form.fechaHoraInicio,
        fechaHoraFin: form.fechaHoraFin,
        precioBase: Number(form.precioBase),
        idioma: form.idioma,
        formato: form.formato,
        estado: form.estado
      };
      if (editando) {
        await api.put(`/api/funciones/${editando.id}`, body);
        mostrarAviso('Función actualizada', 'exito');
      } else {
        await api.post('/api/funciones', body);
        mostrarAviso('Función creada', 'exito');
      }
      setMostrarForm(false);
      cargarTodo();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!(await confirmar('¿Eliminar esta función?', { peligro: true, textoOk: 'Eliminar' }))) return;
    try {
      await api.delete(`/api/funciones/${id}`);
      mostrarAviso('Función eliminada', 'exito');
      cargarTodo();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Funciones</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => abrir()}>+ Agregar Función</button>
      </div>
      {mostrarForm && (
        <div className="form" style={{ maxWidth: 700, marginBottom: '1.5rem' }}>
          <form onSubmit={guardar}>
            <div className="form-group"><label>Película *</label>
              <select className="form-input" value={form.peliculaId} onChange={(e) => setForm({ ...form, peliculaId: e.target.value })} required>
                <option value="">Seleccionar</option>
                {peliculas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Cine *</label>
              <select className="form-input" value={form.cineId} onChange={(e) => setForm({ ...form, cineId: e.target.value, salaId: '' })} required>
                <option value="">Seleccionar</option>
                {cines.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Sala *</label>
              <select className="form-input" value={form.salaId} onChange={(e) => setForm({ ...form, salaId: e.target.value })} required>
                <option value="">Seleccionar</option>
                {salasPorCine.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.capacidad} butacas)</option>)}
              </select>
            </div>
            <div className="form-group"><label>Fecha y Hora Inicio *</label><input type="datetime-local" className="form-input" value={form.fechaHoraInicio} onChange={(e) => setForm({ ...form, fechaHoraInicio: e.target.value })} required /></div>
            <div className="form-group"><label>Fecha y Hora Fin *</label><input type="datetime-local" className="form-input" value={form.fechaHoraFin} onChange={(e) => setForm({ ...form, fechaHoraFin: e.target.value })} required /></div>
            <div className="form-group"><label>Precio Base *</label><input type="number" step="0.01" className="form-input" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} required /></div>
            <div className="form-group"><label>Idioma *</label><input type="text" className="form-input" value={form.idioma} onChange={(e) => setForm({ ...form, idioma: e.target.value })} required /></div>
            <div className="form-group"><label>Formato *</label>
              <select className="form-input" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })}>
                <option value="DOS_D">2D</option>
                <option value="TRES_D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
            <div className="form-group"><label>Estado *</label>
              <select className="form-input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="ACTIVA">ACTIVA</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success">{editando ? 'Actualizar' : 'Guardar'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Película</th>
                <th>Cine/Sala</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Precio</th>
                <th>Formato/Idioma</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {funciones.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center' }}>No hay funciones</td></tr>
              ) : (
                funciones.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.peliculaTitulo}</td>
                    <td>{f.cineNombre} / {f.salaNombre}</td>
                    <td>{f.fechaHoraInicio ? new Date(f.fechaHoraInicio).toLocaleString('es-AR') : '-'}</td>
                    <td>{f.fechaHoraFin ? new Date(f.fechaHoraFin).toLocaleString('es-AR') : '-'}</td>
                    <td>${f.precioBase}</td>
                    <td>{f.formato} / {f.idioma}</td>
                    <td>{f.estado}</td>
                    <td>
                      <button onClick={() => abrir(f)} className="btn btn-sm btn-warning">Modificar</button>
                      <button onClick={() => eliminar(f.id)} className="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
