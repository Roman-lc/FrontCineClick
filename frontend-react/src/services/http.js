// Cliente HTTP. Por defecto usa rutas relativas (/api/...), que en desarrollo pasan por el
// proxy de Vite hacia el backend (ver vite.config.js). VITE_API_BASE_URL permite apuntar a otro host.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
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
