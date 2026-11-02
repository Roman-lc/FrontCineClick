import { leerSesion } from '../lib/sesion';

// Cliente HTTP. La URL del backend sale de VITE_API_URL (ver .env.example). Con "/" usa rutas relativas
// (/api/...), que en desarrollo pasan por el proxy de Vite: sirve para abrir el sitio desde un celular.
const API_URL = import.meta.env.VITE_API_URL;
const BASE = API_URL === '/' ? '' : (API_URL ?? '').replace(/\/+$/, '');

if (!API_URL) {
  console.error(
    '[CineClick] Falta la variable VITE_API_URL. Copiá .env.example como .env (o definila en el entorno) y reiniciá Vite. ' +
      'Sin ella no se puede llamar a la API.'
  );
}

// Misma forma que ErrorResponseDTO del backend: { status, mensaje, detalles }.
// status 0 significa que no se pudo llegar al servidor.
export class ApiError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

// La API no tiene tokens: con sesion iniciada, cada pedido lleva el id del usuario en X-Usuario-Id. El backend
// lo usa para los endpoints de administracion y para saber si un cliente puede usar cada promocion.
function cabecerasDeSesion() {
  const usuarioId = leerSesion()?.usuarioId;
  return usuarioId ? { 'X-Usuario-Id': String(usuarioId) } : {};
}

async function request(path, options = {}) {
  if (!API_URL) throw new ApiError(0, 'Falta configurar la URL de la API (VITE_API_URL)');
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...cabecerasDeSesion(), ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }
  if (!res.ok) {
    let cuerpo = {};
    try {
      cuerpo = await res.json();
    } catch {
      // La respuesta de error no trae JSON
    }
    throw new ApiError(res.status, cuerpo.mensaje || `Error ${res.status}`, cuerpo.detalles || []);
  }
  if (res.status === 204) return null;
  return res.json();
}

const conCuerpo = (body) => (body === undefined ? undefined : JSON.stringify(body));

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: conCuerpo(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: conCuerpo(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: conCuerpo(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
