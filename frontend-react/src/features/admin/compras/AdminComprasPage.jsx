import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminComprasPage() {
  const { mostrarAviso } = useToast();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/compras');
      setCompras(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <section className="section">
      <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al Panel</Link>
      <h2>Gestionar Compras</h2>
      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Función</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Butacas</th>
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hay compras</td></tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.fechaCompra ? new Date(c.fechaCompra).toLocaleString('es-AR') : '-'}</td>
                    <td>{c.clienteNombre || c.clienteId}</td>
                    <td>{c.funcionId}</td>
                    <td>${c.total || 0}</td>
                    <td>{c.estado}</td>
                    <td>{Array.isArray(c.butacas) ? c.butacas.map(b => `${b.fila}${b.numero}`).join(', ') : '-'}</td>
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
