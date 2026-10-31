import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from './AuthContext';
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
import PeliculaPage from '../features/pelicula/PeliculaPage';
import PaginaPendiente from '../features/pendiente/PaginaPendiente';
import NoEncontradaPage from '../features/error/NoEncontradaPage';

// Solo controla lo que muestra la interfaz: la API no tiene autenticacion (limitacion conocida).
function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cines" element={<PaginaPendiente titulo="Cines" etapa={3} />} />
        <Route path="/peliculas/:id" element={<PeliculaPage />} />
        <Route path="/promociones" element={<PaginaPendiente titulo="Promociones" etapa={3} />} />
        <Route path="/grupo" element={<GrupoPage />} />

        {/* key distinta para que al pasar de una ruta a la otra se reinicie la pestaña elegida */}
        <Route path="/login" element={<LoginPage key="login" />} />
        <Route path="/registro" element={<LoginPage key="registro" modoInicial="registro" />} />
        <Route path="/mis-compras" element={<PaginaPendiente titulo="Mis compras" etapa={4} />} />

        <Route path="/compra/:funcionId" element={<PaginaPendiente titulo="Elegí tus butacas" etapa={5} />} />
        <Route path="/compra/:funcionId/pago" element={<PaginaPendiente titulo="Resumen y pago" etapa={5} />} />
        <Route path="/compra/confirmacion/:compraId" element={<PaginaPendiente titulo="Confirmación" etapa={5} />} />

        {/* Pantallas del vanilla que siguen en uso hasta que las reemplacen las etapas 3 y 5 */}
        <Route path="/funciones" element={<FuncionesPage />} />
        <Route path="/detalle" element={<DetallePage />} />
        <Route path="/compra" element={<CompraPage />} />

        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/admin/validar" element={<RequireAdmin><PaginaPendiente titulo="Validar entradas" etapa={5} /></RequireAdmin>} />
        <Route path="/admin/peliculas" element={<RequireAdmin><AdminPeliculasPage /></RequireAdmin>} />
        <Route path="/admin/cines" element={<RequireAdmin><AdminCinesPage /></RequireAdmin>} />
        <Route path="/admin/funciones" element={<RequireAdmin><AdminFuncionesPage /></RequireAdmin>} />
        <Route path="/admin/clientes" element={<RequireAdmin><AdminClientesPage /></RequireAdmin>} />
        <Route path="/admin/promociones" element={<RequireAdmin><AdminPromocionesPage /></RequireAdmin>} />
        <Route path="/admin/compras" element={<RequireAdmin><AdminComprasPage /></RequireAdmin>} />

        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  );
}
