import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminPromocionesPage() {
  const { mostrarAviso, confirmar } = useToast();
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ codigo: '', descripcion: '', tipoDescuento: 'PORCENTAJE', valorDescuento: '', fechaInicio: '', fechaFin: '', activo: true });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/promociones');
      setPromociones(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const abrir = (p = null) => {
    if (p) {
      setEditando(p);
      setForm({
        codigo: p.codigo || '',
        descripcion: p.descripcion || '',
        tipoDescuento: p.tipoDescuento || 'PORCENTAJE',
        valorDescuento: p.valorDescuento || '',
        fechaInicio: p.fechaInicio ? p.fechaInicio.substring(0, 10) : '',
        fechaFin: p.fechaFin ? p.fechaFin.substring(0, 10) : '',
        activo: p.activo !== false
      });
    } else {
      setEditando(null);
      setForm({ codigo: '', descripcion: '', tipoDescuento: 'PORCENTAJE', valorDescuento: '', fechaInicio: '', fechaFin: '', activo: true });
    }
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/api/promociones/${editando.id}`, { ...form, valorDescuento: Number(form.valorDescuento) });
        mostrarAviso('Promoción actualizada', 'exito');
      } else {
        await api.post('/api/promociones', { ...form, valorDescuento: Number(form.valorDescuento) });
        mostrarAviso('Promoción creada', 'exito');
      }
      setMostrarForm(false);
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!(await confirmar('¿Eliminar esta promoción?', { peligro: true, textoOk: 'Eliminar' }))) return;
    try {
      await api.delete(`/api/promociones/${id}`);
      mostrarAviso('Promoción eliminada', 'exito');
      cargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Promociones</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => abrir()}>+ Agregar Promoción</button>
      </div>
      {mostrarForm && (
        <div className="form" style={{ maxWidth: 600, marginBottom: '1.5rem' }}>
          <form onSubmit={guardar}>
            <div className="form-group"><label>Código *</label><input type="text" className="form-input" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required /></div>
            <div className="form-group"><label>Descripción *</label><input type="text" className="form-input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></div>
            <div className="form-group"><label>Tipo de Descuento *</label>
              <select className="form-input" value={form.tipoDescuento} onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}>
                <option value="PORCENTAJE">PORCENTAJE</option>
                <option value="MONTO_FIJO">MONTO FIJO</option>
              </select>
            </div>
            <div className="form-group"><label>Valor Descuento *</label><input type="number" step="0.01" className="form-input" value={form.valorDescuento} onChange={(e) => setForm({ ...form, valorDescuento: e.target.value })} required /></div>
            <div className="form-group"><label>Fecha Inicio *</label><input type="date" className="form-input" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required /></div>
            <div className="form-group"><label>Fecha Fin *</label><input type="date" className="form-input" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} required /></div>
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
                <th>Código</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Vigencia</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promociones.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center' }}>No hay promociones</td></tr>
              ) : (
                promociones.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.codigo}</strong></td>
                    <td>{p.descripcion}</td>
                    <td>{p.tipoDescuento}</td>
                    <td>{p.tipoDescuento === 'PORCENTAJE' ? `${p.valorDescuento}%` : `$${p.valorDescuento}`}</td>
                    <td>{p.fechaInicio} a {p.fechaFin}</td>
                    <td>{p.activo !== false ? 'Sí' : 'No'}</td>
                    <td>
                      <button onClick={() => abrir(p)} className="btn btn-sm btn-warning">Modificar</button>
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
