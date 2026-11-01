// El backend responde los errores de validacion (400) con detalles "campo: mensaje".
// Se separan por campo para mostrarlos debajo de cada control; lo que no es de un campo queda
// como error general del formulario.
export function erroresDeApi(err) {
  const porCampo = {};
  if (err?.status === 400) {
    for (const detalle of err.detalles ?? []) {
      const [campo, ...resto] = detalle.split(':');
      if (resto.length) porCampo[campo.trim()] = resto.join(':').trim();
    }
  }
  const general =
    Object.keys(porCampo).length > 0
      ? ''
      : err?.status === 0
        ? 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
        : err?.status === 400 && err.message
          ? err.message
          : 'No se pudo guardar. Intentá de nuevo en unos minutos.';
  return { porCampo, general };
}

// ["salas", "funciones", "compras"] -> "salas, funciones y compras"
export function listarAsociados(detalles = []) {
  if (detalles.length <= 1) return detalles[0] ?? 'datos';
  return `${detalles.slice(0, -1).join(', ')} y ${detalles[detalles.length - 1]}`;
}
