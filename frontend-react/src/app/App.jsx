import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../features/cartelera/HomePage';
import LoginPage from '../features/auth/LoginPage';
import FuncionesPage from '../features/funciones/FuncionesPage';
import DetallePage from '../features/detalle/DetallePage';
import CompraPage from '../features/compra/CompraPage';
import GrupoPage from '../features/grupo/GrupoPage';
import AdminPage from '../features/admin/AdminPage';
import AdminPeliculasPage from '../features/admin/peliculas/AdminPeliculasPage';
import AdminCinesPage from '../features/admin/cines/AdminCinesPage';
import AdminFuncionesPage from '../features/admin/funciones/AdminFuncionesPage';
import AdminClientesPage from '../features/admin/clientes/AdminClientesPage';
import AdminPromocionesPage from '../features/admin/promociones/AdminPromocionesPage';
import AdminComprasPage from '../features/admin/compras/AdminComprasPage';

function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
  if (!user || user.rol !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/funciones" element={<FuncionesPage />} />
        <Route path="/detalle" element={<DetallePage />} />
        <Route path="/compra" element={<CompraPage />} />
        <Route path="/grupo" element={<GrupoPage />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/admin/peliculas" element={<RequireAdmin><AdminPeliculasPage /></RequireAdmin>} />
        <Route path="/admin/cines" element={<RequireAdmin><AdminCinesPage /></RequireAdmin>} />
        <Route path="/admin/funciones" element={<RequireAdmin><AdminFuncionesPage /></RequireAdmin>} />
        <Route path="/admin/clientes" element={<RequireAdmin><AdminClientesPage /></RequireAdmin>} />
        <Route path="/admin/promociones" element={<RequireAdmin><AdminPromocionesPage /></RequireAdmin>} />
        <Route path="/admin/compras" element={<RequireAdmin><AdminComprasPage /></RequireAdmin>} />
      </Route>
    </Routes>
  );
}
