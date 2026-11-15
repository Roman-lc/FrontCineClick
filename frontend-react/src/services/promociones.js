import { api } from './http';

export async function getPromocionesVigentes() {
  return api.get('/api/promociones/vigentes');
}
