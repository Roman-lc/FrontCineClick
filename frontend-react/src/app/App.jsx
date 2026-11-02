import { lazy, Suspense } from 'react';
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
import { EsqueletoFilas } from '../components/ui/Esqueletos';
import { rutaLogin } from '../lib/volver';
import AdminPeliculasPage from '../features/admin/peliculas/AdminPeliculasPage';
import AdminCinesPage from '../features/admin/cines/AdminCinesPage';
import AdminSalasPage from '../features/admin/salas/AdminSalasPage';
import ValidarEntradasPage from '../features/admin/validar/ValidarEntradasPage';
import AdminLayout from '../components/layout/AdminLayout';
import AdminFuncionesPage from '../features/admin/funciones/AdminFuncionesPage';
import AdminClientesPage from '../features/admin/clientes/AdminClientesPage';
import AdminPromocionesPage from '../features/admin/promociones/AdminPromocionesPage';
import AdminComprasPage from '../features/admin/compras/AdminComprasPage';
import PeliculaPage from '../features/pelicula/PeliculaPage';
import NoEncontradaPage from '../features/error/NoEncontradaPage';
import NosotrosPage from '../features/institucional/NosotrosPage';
import TerminosPage from '../features/institucional/TerminosPage';
import PrivacidadPage from '../features/institucional/PrivacidadPage';
import ArrepentimientoPage from '../features/solicitudes/ArrepentimientoPage';
import SoportePage from '../features/solicitudes/SoportePage';
import AdminArrepentimientosPage from '../features/admin/arrepentimientos/AdminArrepentimientosPage';
import AdminSoportePage from '../features/admin/soporte/AdminSoportePage';
import CinesPage from '../features/cines/CinesPage';
import CinePage from '../features/cines/CinePage';
import PromocionesPage from '../features/promociones/PromocionesPage';
import MisComprasPage from '../features/cuenta/MisComprasPage';

// Las metricas (y Recharts) se cargan aparte: no entran en el bundle del sitio publico
const MetricasPage = lazy(() => import('../features/admin/metricas/MetricasPage'));

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
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/grupo" element={<Navigate to="/nosotros" replace />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        {/* Publicas, sin login ni registro (la de arrepentimiento lo exige la Resolucion 424/2020) */}
        <Route path="/arrepentimiento" element={<ArrepentimientoPage />} />
        <Route path="/soporte" element={<SoportePage />} />

        {/* key distinta para que al pasar de una ruta a la otra se reinicie la pestaña elegida */}
        <Route path="/login" element={<LoginPage key="login" />} />
        <Route path="/registro" element={<LoginPage key="registro" modoInicial="registro" />} />
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

      {/* Panel: layout propio (tema claro, navegacion lateral), sin el header ni el footer del sitio */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route
          index
          element={
            <Suspense fallback={<EsqueletoFilas cantidad={4} alto={118} etiqueta="Cargando métricas" />}>
              <MetricasPage />
            </Suspense>
          }
        />
        <Route path="cines" element={<AdminCinesPage />} />
        <Route path="salas" element={<AdminSalasPage />} />
        <Route path="peliculas" element={<AdminPeliculasPage />} />
        <Route path="funciones" element={<AdminFuncionesPage />} />
        <Route path="promociones" element={<AdminPromocionesPage />} />
        <Route path="validar" element={<ValidarEntradasPage />} />
        <Route path="arrepentimientos" element={<AdminArrepentimientosPage />} />
        <Route path="soporte" element={<AdminSoportePage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="compras" element={<AdminComprasPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  );
}
