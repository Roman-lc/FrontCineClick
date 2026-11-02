// Sesion guardada en el navegador. La lee AuthContext para la interfaz y http.js para mandar X-Usuario-Id.
const CLAVE = 'cineclick_user';

export function leerSesion() {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario) {
  try {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin acceso al storage la sesion dura hasta recargar
  }
}
