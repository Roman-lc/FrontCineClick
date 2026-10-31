import { api } from './http';
import { USE_MOCKS } from '../mocks/simular';
import { loginMock, registrarMock } from '../mocks/usuarios';

// LoginResponseDTO: { usuarioId, clienteId (null para ADMIN), nombre, apellido, nombreCompleto,
//   email, rol: 'ADMIN' | 'CLIENTE', mensaje }
export async function iniciarSesion(email, password) {
  if (USE_MOCKS) return loginMock(email, password);
  return api.post('/api/auth/login', { email, password });
}

// ClienteRequestDTO: { nombre, apellido, email, password, telefono }
export async function registrarCliente(datos) {
  if (USE_MOCKS) return registrarMock(datos);
  return api.post('/api/clientes', datos);
}
