import { api } from './http';

// CineResponseDTO: { id, nombre, provincia, localidad, calle, altura, telefono (10 digitos), urlImagen, activo,
//   salas: [{ id, cineId, cineNombre, nombre, numero, tipo, activa, capacidad }] }

export async function getCines() {
  return api.get('/api/cines');
}
