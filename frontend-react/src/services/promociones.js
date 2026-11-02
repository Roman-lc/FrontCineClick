import { api } from './http';
import { USE_MOCKS, simular } from '../mocks/simular';
import { promocionesMock } from '../mocks/promociones';

// PromocionResponseDTO: { id, codigo, titulo, descripcion (aclaraciones), porcentajeDescuento, vigenciaDesde,
//   vigenciaHasta, activa, diasSemana: ['MONDAY', ...] (vacio = todos), usosMaximosTotales, usosActuales,
//   usosMaximosPorUsuario, soloPrimeraCompra, maxEntradasConDescuento, montoMaximoDescuento, usablePorUsuario,
//   motivoNoUsable }. /vigentes: las que se pueden usar ahora (activas, en fecha y con cupo).
// Con usuarioId (sesion de cliente), cada una dice si ese cliente la puede usar y por que no.
export async function getPromocionesVigentes(usuarioId) {
  if (USE_MOCKS) return simular(promocionesMock);
  return api.get('/api/promociones/vigentes', usuarioId ? { headers: { 'X-Usuario-Id': String(usuarioId) } } : undefined);
}
