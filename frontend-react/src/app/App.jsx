import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from './useAuth';
import HomePage from '../features/cartelera/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RecuperarPage from '../features/auth/RecuperarPage';
import RestablecerPasswordPage from '../features/auth/RestablecerPasswordPage';
import CompraLayout from '../features/compra/CompraLayout';
import PasoEntradas from '../features/compra/PasoEntradas';
import PasoButacas from '../features/compra/PasoButacas';
import PasoPago from '../features/compra/PasoPago';
import ConfirmacionPage from '../features/compra/ConfirmacionPage';
import EstadoVacio from '../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../components/ui/Esqueletos';
import PeliculaPage from '../features/pelicula/PeliculaPage';
import NoEncontradaPage from '../features/error/NoEncontradaPage';
import NosotrosPage from '../features/institucional/NosotrosPage';
import TerminosPage from '../features/institucional/TerminosPage';
import PrivacidadPage from '../features/institucional/PrivacidadPage';
import ArrepentimientoPage from '../features/solicitudes/ArrepentimientoPage';
import SoportePage from '../features/solicitudes/SoportePage';
import CinesPage from '../features/cines/CinesPage';
import CinePage from '../features/cines/CinePage';
import PromocionesPage from '../features/promociones/PromocionesPage';
import MisComprasPage from '../features/cuenta/MisComprasPage';

const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const MetricasPage = lazy(() => import('../features/admin/metricas/MetricasPage'));
const AdminCinesPage = lazy(() => import('../features/admin/cines/AdminCinesPage'));
const AdminSalasPage = lazy(() => import('../features/admin/salas/AdminSalasPage'));
const AdminPeliculasPage = lazy(() => import('../features/admin/peliculas/AdminPeliculasPage'));
const AdminFuncionesPage = lazy(() => import('../features/admin/funciones/AdminFuncionesPage'));
const AdminPromocionesPage = lazy(() => import('../features/admin/promociones/AdminPromocionesPage'));
const AdminComprasPage = lazy(() => import('../features/admin/compras/AdminComprasPage'));
const ValidarEntradasPage = lazy(() => import('../features/admin/validar/ValidarEntradasPage'));
const AdminArrepentimientosPage = lazy(() => import('../features/admin/arrepentimientos/AdminArrepentimientosPage'));
const AdminSoportePage = lazy(() => import('../features/admin/soporte/AdminSoportePage'));

function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function RequireCliente({ children }) {
  const { user, isAdmin } = useAuth();
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
  if (!user?.clienteId) return <Navigate to="/login" replace />;
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
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/grupo" element={<Navigate to="/nosotros" replace />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/arrepentimiento" element={<ArrepentimientoPage />} />
        <Route path="/soporte" element={<SoportePage />} />

        <Route path="/login" element={<LoginPage key="login" />} />
        <Route path="/registro" element={<LoginPage key="registro" modoInicial="registro" />} />
        <Route path="/login/recuperar" element={<RecuperarPage />} />
        <Route path="/restablecer" element={<RestablecerPasswordPage />} />
        <Route path="/mis-compras" element={<RequireCliente><MisComprasPage /></RequireCliente>} />

        <Route path="/compra/confirmacion/:compraId" element={<RequireCliente><ConfirmacionPage /></RequireCliente>} />
        <Route path="/compra/:funcionId" element={<RequireCliente><CompraLayout /></RequireCliente>}>
          <Route index element={<Navigate to="entradas" replace />} />
          <Route path="entradas" element={<PasoEntradas />} />
          <Route path="butacas" element={<PasoButacas />} />
          <Route path="pago" element={<PasoPago />} />
        </Route>

        <Route path="*" element={<NoEncontradaPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Suspense fallback={<EsqueletoFilas cantidad={6} alto={52} etiqueta="Cargando el panel" />}>
              <AdminLayout />
            </Suspense>
          </RequireAdmin>
        }
      >
        <Route index element={<MetricasPage />} />
        <Route path="cines" element={<AdminCinesPage />} />
        <Route path="salas" element={<AdminSalasPage />} />
        <Route path="peliculas" element={<AdminPeliculasPage />} />
        <Route path="funciones" element={<AdminFuncionesPage />} />
        <Route path="promociones" element={<AdminPromocionesPage />} />
        <Route path="validar" element={<ValidarEntradasPage />} />
        <Route path="arrepentimientos" element={<AdminArrepentimientosPage />} />
        <Route path="soporte" element={<AdminSoportePage />} />
        <Route path="compras" element={<AdminComprasPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  );
}
