import { ApiError } from '../services/http';
import { simular } from './simular';

// Usuarios de prueba para trabajar sin backend. El admin es el mismo que crea el DataSeeder.
const usuarios = [
  { usuarioId: 1, clienteId: null, nombre: 'Admin', apellido: 'CineClick', email: 'admin@cineclick.com', password: 'admin123', rol: 'ADMIN' },
  { usuarioId: 2, clienteId: 1, nombre: 'Ana', apellido: 'Gómez', email: 'cliente@cineclick.com', password: 'cliente123', rol: 'CLIENTE' },
];

const buscarPorEmail = (email) => usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

async function fallar(status, mensaje) {
  await simular(null);
  throw new ApiError(status, mensaje);
}

// Misma forma que LoginResponseDTO
export async function loginMock(email, password) {
  const usuario = buscarPorEmail(email);
  if (!usuario || usuario.password !== password) return fallar(401, 'Email o password incorrectos');
  return simular({
    usuarioId: usuario.usuarioId,
    clienteId: usuario.clienteId,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
    email: usuario.email,
    rol: usuario.rol,
    mensaje: `Login correcto para usuario ${usuario.rol}`,
  });
}

// Misma forma que ClienteResponseDTO. Los usuarios nuevos duran hasta que se recarga la pagina.
export async function registrarMock({ nombre, apellido, email, password, telefono }) {
  if (buscarPorEmail(email)) return fallar(409, `Ya existe un usuario con email ${email}`);
  const usuarioId = usuarios.length + 1;
  const clienteId = usuarios.filter((u) => u.clienteId).length + 1;
  usuarios.push({ usuarioId, clienteId, nombre, apellido, email, password, rol: 'CLIENTE' });
  return simular({ id: clienteId, usuarioId, nombre, apellido, email, telefono, fechaRegistro: new Date().toISOString(), activo: true });
}
