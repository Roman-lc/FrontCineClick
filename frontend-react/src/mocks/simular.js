import { ApiError } from '../services/http';

// VITE_USE_MOCKS=true hace que los servicios respondan con los datos de esta carpeta.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Demora para que se vean los estados de carga mientras se trabaja sin backend.
const DEMORA_MS = 400;

// Con VITE_MOCK_ERROR=true todas las respuestas fallan, para probar los estados de error.
export async function simular(datos) {
  await new Promise((resolve) => setTimeout(resolve, DEMORA_MS));
  if (import.meta.env.VITE_MOCK_ERROR === 'true') {
    throw new ApiError(500, 'Error simulado (VITE_MOCK_ERROR=true)');
  }
  return structuredClone(datos);
}

export async function simularNoEncontrado(mensaje) {
  await new Promise((resolve) => setTimeout(resolve, DEMORA_MS));
  throw new ApiError(404, mensaje);
}
