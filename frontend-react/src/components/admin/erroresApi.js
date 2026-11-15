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

export function listarAsociados(detalles = []) {
  if (detalles.length <= 1) return detalles[0] ?? 'datos';
  return `${detalles.slice(0, -1).join(', ')} y ${detalles[detalles.length - 1]}`;
}
