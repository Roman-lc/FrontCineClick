import { api } from './http';

// PromocionResponseDTO: { id, codigo, titulo, descripcion (aclaraciones), porcentajeDescuento, vigenciaDesde,
//   vigenciaHasta, activa, diasSemana: ['MONDAY', ...] (vacio = todos), usosMaximosTotales, usosActuales,
//   usosMaximosPorUsuario, soloPrimeraCompra, maxEntradasConDescuento, montoMaximoDescuento, usablePorUsuario,
//   motivoNoUsable }. /vigentes: las que se pueden usar ahora (activas, en fecha y con cupo).
// Con sesion de cliente (X-Usuario-Id, lo agrega http.js), cada una dice si ese cliente la puede usar y por que no.
export async function getPromocionesVigentes() {
  return api.get('/api/promociones/vigentes');
}
