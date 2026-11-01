import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from './AuthContext';
import HomePage from '../features/cartelera/HomePage';
import LoginPage from '../features/auth/LoginPage';
import CompraLayout from '../features/compra/CompraLayout';
import PasoEntradas from '../features/compra/PasoEntradas';
import PasoButacas from '../features/compra/PasoButacas';
import PasoPago from '../features/compra/PasoPago';
import ConfirmacionPage from '../features/compra/ConfirmacionPage';
import EstadoVacio from '../components/ui/EstadoVacio';
import { rutaLogin } from '../lib/volver';
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
import LegalesPage from '../features/legales/LegalesPage';
import CinesPage from '../features/cines/CinesPage';
import CinePage from '../features/cines/CinePage';
import PromocionesPage from '../features/promociones/PromocionesPage';

// Solo controla lo que muestra la interfaz: la API no tiene autenticacion (limitacion conocida).
function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Sin sesion de cliente se va al login, que despues vuelve a esta misma pantalla
function RequireCliente({ children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (isAdmin) {
    return (
      <section className="section">
        <EstadoVacio mensaje="Las cuentas de administrador no pueden comprar entradas.">
          <Link to="/" className="btn btn-primary">
            Volver a la cartelera
          </Link>
        </EstadoVacio>
      </section>
    );
  }
  if (!user?.clienteId) return <Navigate to={rutaLogin(location.pathname)} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cines" element={<CinesPage />} />
        <Route path="/cines/:slug" element={<CinePage />} />
        <Route path="/peliculas/:slug" element={<PeliculaPage />} />
        <Route path="/promociones" element={<PromocionesPage />} />
        <Route path="/grupo" element={<GrupoPage />} />
        <Route path="/terminos" element={<LegalesPage key="terminos" tipo="terminos" />} />
        <Route path="/privacidad" element={<LegalesPage key="privacidad" tipo="privacidad" />} />
        <Route path="/arrepentimiento" element={<LegalesPage key="arrepentimiento" tipo="arrepentimiento" />} />

        {/* key distinta para que al pasar de una ruta a la otra se reinicie la pestaña elegida */}
        <Route path="/login" element={<LoginPage key="login" />} />
        <Route path="/registro" element={<LoginPage key="registro" modoInicial="registro" />} />
        <Route path="/mis-compras" element={<PaginaPendiente titulo="Mis compras" etapa={4} />} />

        <Route path="/compra/confirmacion/:compraId" element={<RequireCliente><ConfirmacionPage /></RequireCliente>} />
        <Route path="/compra/:funcionId" element={<RequireCliente><CompraLayout /></RequireCliente>}>
          <Route index element={<Navigate to="entradas" replace />} />
          <Route path="entradas" element={<PasoEntradas />} />
          <Route path="butacas" element={<PasoButacas />} />
          <Route path="pago" element={<PasoPago />} />
        </Route>

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
