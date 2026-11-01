import { api } from './http';
import { USE_MOCKS, simular } from '../mocks/simular';
import { promocionesMock } from '../mocks/promociones';

// PromocionResponseDTO: { id, codigo, titulo, descripcion (las condiciones), porcentajeDescuento, fechaInicio,
//   fechaFin, activa }. /vigentes devuelve solo las activas dentro de sus fechas, las que vencen antes primero.
export async function getPromocionesVigentes() {
  if (USE_MOCKS) return simular(promocionesMock);
  return api.get('/api/promociones/vigentes');
}
