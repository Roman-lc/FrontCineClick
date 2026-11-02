import { api } from './http';

// LoginResponseDTO: { usuarioId, clienteId (null para ADMIN), nombre, apellido, nombreCompleto,
//   email, rol: 'ADMIN' | 'CLIENTE', mensaje }
export async function iniciarSesion(email, password) {
  return api.post('/api/auth/login', { email, password });
}

// ClienteRequestDTO: { nombre, apellido, email, password, telefono }
export async function registrarCliente(datos) {
  return api.post('/api/clientes', datos);
}
