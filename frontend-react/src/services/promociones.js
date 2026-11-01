import { api } from './http';
import { USE_MOCKS, simular } from '../mocks/simular';
import { promocionesMock } from '../mocks/promociones';

// PromocionResponseDTO: { id, codigo, descripcion, porcentajeDescuento, fechaInicio, fechaFin, activa }
// El backend devuelve solo las activas.
export async function getPromociones() {
  if (USE_MOCKS) return simular(promocionesMock);
  return api.get('/api/promociones');
}
