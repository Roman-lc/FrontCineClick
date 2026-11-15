import { api } from './http';

export function buscarCompra(email, codigo) {
  return api.get(`/api/compras/buscar?email=${encodeURIComponent(email)}&codigo=${encodeURIComponent(codigo)}`);
}

export function enviarArrepentimiento(datos) {
  return api.post('/api/arrepentimientos', datos);
}

export function enviarSoporte(datos) {
  return api.post('/api/soporte', datos);
}
