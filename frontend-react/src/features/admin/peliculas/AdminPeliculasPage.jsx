import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/http';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../app/AuthContext';

export default function AdminPeliculasPage() {
  const { mostrarAviso, confirmar } = useToast();
  const { user } = useAuth();
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    titulo: '', sinopsis: '', duracionMinutos: '', clasificacion: '', genero: 'ACCION', idioma: 'ES', pais: 'Argentina', fechaEstreno: '', urlPoster: '', activa: true
  });

  useEffect(() => {
    cargarPeliculas();
  }, []);

  const cargarPeliculas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/peliculas');
      setPeliculas(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const abrirFormulario = (p = null) => {
    if (p) {
      setEditando(p);
      setForm({
        titulo: p.titulo || '', sinopsis: p.sinopsis || '', duracionMinutos: p.duracionMinutos || '', clasificacion: p.clasificacion || '', genero: p.genero || 'ACCION', idioma: p.idioma || 'ES', pais: p.pais || 'Argentina', fechaEstreno: p.fechaEstreno || '', urlPoster: p.urlPoster || '', activa: p.activa !== false
      });
    } else {
      setEditando(null);
      setForm({
        titulo: '', sinopsis: '', duracionMinutos: '', clasificacion: '', genero: 'ACCION', idioma: 'ES', pais: 'Argentina', fechaEstreno: '', urlPoster: '', activa: true
      });
    }
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/api/peliculas/${editando.id}`, { ...form, duracionMinutos: Number(form.duracionMinutos) });
        mostrarAviso('Película actualizada', 'exito');
      } else {
        await api.post('/api/peliculas', { ...form, duracionMinutos: Number(form.duracionMinutos) });
        mostrarAviso('Película creada', 'exito');
      }
      setMostrarForm(false);
      cargarPeliculas();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!(await confirmar('¿Eliminar esta película?', { peligro: true, textoOk: 'Eliminar' }))) return;
    try {
      await api.delete(`/api/peliculas/${id}`);
      mostrarAviso('Película eliminada', 'exito');
      cargarPeliculas();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Películas</h2>
      <div className="admin-actions" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => abrirFormulario()}>+ Agregar Película</button>
      </div>
      {mostrarForm && (
        <div className="form form-large" style={{ maxWidth: 700, marginBottom: '1.5rem' }}>
          <form onSubmit={guardar}>
            <input type="hidden" value={editando?.id || ''} />
            <div className="form-group"><label>Título *</label><input type="text" className="form-input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
            <div className="form-group"><label>Sinopsis *</label><textarea className="form-input" rows="3" value={form.sinopsis} onChange={(e) => setForm({ ...form, sinopsis: e.target.value })} required /></div>
            <div className="form-group"><label>Duración (minutos) *</label><input type="number" className="form-input" value={form.duracionMinutos} onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value })} required /></div>
            <div className="form-group"><label>Clasificación *</label><input type="text" className="form-input" value={form.clasificacion} onChange={(e) => setForm({ ...form, clasificacion: e.target.value })} placeholder="ATP, +13, etc." required /></div>
            <div className="form-group"><label>Género *</label>
              <select className="form-input" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
                <option value="ACCION">ACCIÓN</option>
                <option value="AVENTURA">AVENTURA</option>
                <option value="COMEDIA">COMEDIA</option>
                <option value="DRAMA">DRAMA</option>
                <option value="TERROR">TERROR</option>
                <option value="CIENCIA_FICCION">CIENCIA FICCIÓN</option>
                <option value="ROMANCE">ROMANCE</option>
                <option value="ANIMACION">ANIMACIÓN</option>
              </select>
            </div>
            <div className="form-group"><label>Idioma *</label><input type="text" className="form-input" value={form.idioma} onChange={(e) => setForm({ ...form, idioma: e.target.value })} required /></div>
            <div className="form-group"><label>País *</label><input type="text" className="form-input" value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} required /></div>
            <div className="form-group"><label>Fecha de Estreno *</label><input type="date" className="form-input" value={form.fechaEstreno} onChange={(e) => setForm({ ...form, fechaEstreno: e.target.value })} required /></div>
            <div className="form-group"><label>URL Poster</label><input type="text" className="form-input" value={form.urlPoster} onChange={(e) => setForm({ ...form, urlPoster: e.target.value })} /></div>
            <div className="form-group"><label><input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa</label></div>
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
                <th>Título</th>
                <th>Género</th>
                <th>Duración</th>
                <th>Clasificación</th>
                <th>Activa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {peliculas.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hay películas</td></tr>
              ) : (
                peliculas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.titulo}</strong></td>
                    <td>{p.genero}</td>
                    <td>{p.duracionMinutos} min</td>
                    <td>{p.clasificacion}</td>
                    <td>{p.activa !== false ? 'Sí' : 'No'}</td>
                    <td>
                      <button onClick={() => abrirFormulario(p)} className="btn btn-sm btn-warning">Modificar</button>
                      <button onClick={() => eliminar(p.id)} className="btn btn-sm btn-danger">Eliminar</button>
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
