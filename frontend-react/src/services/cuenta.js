import { api } from './http';

export async function getCuenta() {
  return api.get('/api/usuarios/me');
}

export async function actualizarDatos(datos) {
  return api.patch('/api/usuarios/me', datos);
}

export async function pedirCambioEmail(email, contrasena) {
  return api.post('/api/usuarios/me/email', { email, contrasena });
}

export async function reenviarCambioEmail() {
  return api.post('/api/usuarios/me/email/reenviar');
}

export async function cancelarCambioEmail() {
  return api.delete('/api/usuarios/me/email');
}

export async function confirmarCambioEmail(token) {
  return api.post('/api/usuarios/me/email/confirmar', { token });
}

export async function cambiarContrasena(actual, nueva) {
  return api.put('/api/usuarios/me/contrasena', { actual, nueva });
}

export async function cambiarComunicaciones(recibirNovedades) {
  return api.patch('/api/usuarios/me/comunicaciones', { recibirNovedades });
}

export async function exportarDatos(contrasena) {
  return api.post('/api/usuarios/me/exportar', { contrasena });
}

export async function eliminarCuenta(contrasena) {
  return api.delete('/api/usuarios/me', { contrasena });
}

export function erroresPorCampo(err) {
  return Object.fromEntries(
    (err?.detalles ?? [])
      .map((d) => d.match(/^(\w+): (.*)$/))
      .filter(Boolean)
      .map(([, campo, mensaje]) => [campo, mensaje])
  );
}
