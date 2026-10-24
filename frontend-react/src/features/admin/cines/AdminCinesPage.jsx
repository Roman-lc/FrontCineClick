import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminCinesPage() {
  const { mostrarAviso, confirmar } = useToast();
  const [cines, setCines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/cines');
      setCines(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const abrir = (c = null) => {
    if (c) {
      setEditando(c);
      setForm({ nombre: c.nombre || '', direccion: c.direccion || '', ciudad: c.ciudad || '', telefono: c.telefono || '', activo: c.activo !== false });
    } else {
      setEditando(null);
      setForm({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });
    }
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/api/cines/${editando.id}`, form);
        mostrarAviso('Cine actualizado', 'exito');
      } else {
        await api.post('/api/cines', form);
        mostrarAviso('Cine creado', 'exito');
      }
      setMostrarForm(false);
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!(await confirmar('¿Eliminar este cine?', { peligro: true, textoOk: 'Eliminar' }))) return;
    try {
      await api.delete(`/api/cines/${id}`);
      mostrarAviso('Cine eliminado', 'exito');
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Cines</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => abrir()}>+ Agregar Cine</button>
      </div>
      {mostrarForm && (
        <div className="form" style={{ maxWidth: 600, marginBottom: '1.5rem' }}>
          <form onSubmit={guardar}>
            <div className="form-group"><label>Nombre *</label><input type="text" className="form-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Dirección *</label><input type="text" className="form-input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required /></div>
            <div className="form-group"><label>Ciudad *</label><input type="text" className="form-input" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required /></div>
            <div className="form-group"><label>Teléfono</label><input type="text" className="form-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <div className="form-group"><label><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo</label></div>
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
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cines.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hay cines</td></tr>
              ) : (
                cines.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre}</td>
                    <td>{c.ciudad}</td>
                    <td>{c.direccion}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.activo !== false ? 'Sí' : 'No'}</td>
                    <td>
                      <button onClick={() => abrir(c)} className="btn btn-sm btn-warning">Modificar</button>
                      <button onClick={() => eliminar(c.id)} className="btn btn-sm btn-danger">Eliminar</button>
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
