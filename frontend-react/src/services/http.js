import { leerSesion } from '../lib/sesion';

const API_URL = import.meta.env.VITE_API_URL;
const BASE = API_URL === '/' ? '' : (API_URL ?? '').replace(/\/+$/, '');

if (!API_URL) {
  console.error(
    '[CineClick] Falta la variable VITE_API_URL. Copiá .env.example como .env (o definila en el entorno) y reiniciá Vite. ' +
      'Sin ella no se puede llamar a la API.'
  );
}

export class ApiError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

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
    } catch {}
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
  delete: (path, body) => request(path, { method: 'DELETE', body: conCuerpo(body) }),
};
