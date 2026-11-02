import { api } from './http';

// Busqueda publica de una compra para las solicitudes (arrepentimiento y soporte). codigo: numero de compra
// o el codigo de cualquier entrada. ResumenCompraDTO: { compraId, peliculaTitulo, fechaHoraInicio, cineNombre,
//   salaNombre, cantidadEntradas, total, estado, fechaCompra, elegibleArrepentimiento, motivoNoElegible,
//   codigoArrepentimiento }. Si el email o el codigo no coinciden: 404 (el mismo error en los dos casos).
export function buscarCompra(email, codigo) {
  return api.get(`/api/compras/buscar?email=${encodeURIComponent(email)}&codigo=${encodeURIComponent(codigo)}`);
}

// ArrepentimientoResponseDTO: { codigo ("ARR-XXXXXXXX"), estado: 'APROBADA' | 'FUERA_DE_PLAZO' | 'RECHAZADA',
//   montoReembolso, motivoFueraDePlazo, ... }. Una segunda solicitud de la misma compra devuelve la misma.
export function enviarArrepentimiento(datos) {
  return api.post('/api/arrepentimientos', datos);
}

// SoporteResponseDTO: { numero ("SOP-XXXXXXXX"), estado, ... }. claveIdempotencia evita duplicados.
export function enviarSoporte(datos) {
  return api.post('/api/soporte', datos);
}
