import { api } from './http';
import { USE_MOCKS, simular } from '../mocks/simular';
import { cinesMock } from '../mocks/cines';

// CineResponseDTO: { id, nombre, provincia, localidad, calle, altura, telefono (10 digitos), urlImagen, activo,
//   salas: [{ id, cineId, cineNombre, nombre, numero, tipo, activa, capacidad }] }

export async function getCines() {
  if (USE_MOCKS) return simular(cinesMock);
  return api.get('/api/cines');
}
