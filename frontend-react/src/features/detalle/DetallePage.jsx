import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { fechaHoraCorta, horaCorta } from '../../lib/fechas';

function buildQuery(params) {
  const q = new URLSearchParams();
  if (params.get('peliculaId')) q.set('peliculaId', params.get('peliculaId'));
  if (params.get('cineId')) q.set('cineId', params.get('cineId'));
  if (params.get('fecha')) q.set('fecha', params.get('fecha'));
  return q;
}

export default function DetallePage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [funcion, setFuncion] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('ID de función no especificado');
      return;
    }
    cargarDetalle(id);
  }, [id]);

  const cargarDetalle = async (funcionId) => {
    setLoading(true);
    setError('');
    try {
      const f = await api.get(`/api/funciones/${funcionId}`);
      setFuncion(f);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const qVolver = buildQuery(searchParams);
  const volverHref = `/funciones${qVolver.toString() ? '?' + qVolver.toString() : ''}`;
  const qComprar = new URLSearchParams({ id });
  if (searchParams.get('peliculaId')) qComprar.set('peliculaId', searchParams.get('peliculaId'));
  if (searchParams.get('cineId')) qComprar.set('cineId', searchParams.get('cineId'));
  if (searchParams.get('fecha')) qComprar.set('fecha', searchParams.get('fecha'));

  return (
    <section className="section">
      <Link to={volverHref} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver al listado</Link>
      {loading && <div className="loading">Cargando detalle...</div>}
      {error && <div className="error">{error}</div>}
      {funcion && !loading && (
        <div className="detail-card">
          <h2>{funcion.peliculaTitulo} - {String(funcion.formato || '').replace('_', 'D')}</h2>
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>📝 Sinopsis:</strong></p>
            <p style={{ textAlign: 'justify' }}>Consultá detalles completos desde el backend.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            <p><strong>⏱️ Duración:</strong> -</p>
            <p><strong>🎭 Género:</strong> -</p>
            <p><strong>🔞 Clasificación:</strong> -</p>
            <p><strong>🎞️ Formato:</strong> {String(funcion.formato || '').replace('_', 'D')}</p>
            <p><strong>🌐 Idioma de la función:</strong> {funcion.idioma}</p>
            <p><strong>💰 Precio Base:</strong> <span style={{ color: 'var(--success)', fontWeight: 600 }}>${(funcion.precioBase || 0).toLocaleString('es-AR')}</span></p>
          </div>
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>📍 Información de la Función</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            <p><strong>🏢 Cine:</strong> {funcion.cineNombre}</p>
            <p><strong>🏛️ Sala:</strong> {funcion.salaNombre} (ID: {funcion.salaId})</p>
            <p><strong>📅 Fecha y Hora:</strong> {fechaHoraCorta(funcion.fechaHoraInicio)} a {horaCorta(funcion.fechaHoraFin)}</p>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <Link to={`/compra?${qComprar.toString()}`} className="btn btn-success">🎟️ Comprar Entradas</Link>
            <Link to={volverHref} className="btn btn-secondary">Volver al Listado</Link>
          </div>
        </div>
      )}
    </section>
  );
}
