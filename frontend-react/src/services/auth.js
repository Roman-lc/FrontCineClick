import { api } from './http';

export async function iniciarSesion(email, password) {
  return api.post('/api/auth/login', { email, password });
}

export async function registrarCliente(datos) {
  return api.post('/api/clientes', datos);
}

export async function solicitarRecuperacion(email) {
  return api.post('/api/auth/recuperar', { email });
}

export async function validarTokenRecuperacion(token) {
  return api.get(`/api/auth/recuperar/${encodeURIComponent(token)}`);
}

export async function restablecerPassword(token, password) {
  return api.post('/api/auth/restablecer', { token, password });
}
