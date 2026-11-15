import { api } from './http';

export async function getCines() {
  return api.get('/api/cines');
}
