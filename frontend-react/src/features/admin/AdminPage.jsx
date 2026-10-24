import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  return (
    <section className="section">
      <h2>Panel de Administrador</h2>
      <div className="alert alert-warning" style={{ background: '#fff3cd', color: '#856404', padding: '0.75rem 1rem', borderRadius: '4px', borderLeft: '4px solid #ffc107', marginBottom: '1rem' }}>
        ⚠️ Solo acceso para usuarios con rol ADMIN
      </div>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>Bienvenido, {user?.nombre || user?.email}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/funciones" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>🎭 Gestionar Funciones</Link>
        <Link to="/admin/peliculas" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>🎬 Gestionar Películas</Link>
        <Link to="/admin/cines" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>🏢 Gestionar Cines y Salas</Link>
        <Link to="/admin/clientes" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>👥 Gestionar Clientes</Link>
        <Link to="/admin/promociones" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>🎟️ Gestionar Promociones</Link>
        <Link to="/admin/compras" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none' }}>💳 Gestionar Compras</Link>
      </div>
    </section>
  );
}
