import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/http';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminClientesPage() {
  const { mostrarAviso, confirmar } = useToast();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', activo: true });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/clientes');
      setClientes(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const abrir = (c = null) => {
    if (c) {
      setEditando(c);
      setForm({ nombre: c.nombre || '', apellido: c.apellido || '', email: c.email || '', telefono: c.telefono || '', fechaNacimiento: c.fechaNacimiento || '', activo: c.activo !== false });
    } else {
      setEditando(null);
      setForm({ nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', activo: true });
    }
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/api/clientes/${editando.id}`, form);
        mostrarAviso('Cliente actualizado', 'exito');
      } else {
        await api.post('/api/clientes', form);
        mostrarAviso('Cliente creado', 'exito');
      }
      setMostrarForm(false);
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!(await confirmar('¿Eliminar este cliente?', { peligro: true, textoOk: 'Eliminar' }))) return;
    try {
      await api.delete(`/api/clientes/${id}`);
      mostrarAviso('Cliente eliminado', 'exito');
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Clientes</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => abrir()}>+ Agregar Cliente</button>
      </div>
      {mostrarForm && (
        <div className="form" style={{ maxWidth: 600, marginBottom: '1.5rem' }}>
          <form onSubmit={guardar}>
            <div className="form-group"><label>Nombre *</label><input type="text" className="form-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Apellido *</label><input type="text" className="form-input" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required /></div>
            <div className="form-group"><label>Email *</label><input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="form-group"><label>Teléfono</label><input type="text" className="form-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <div className="form-group"><label>Fecha Nacimiento</label><input type="date" className="form-input" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} /></div>
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
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hay clientes</td></tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.email}</td>
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
