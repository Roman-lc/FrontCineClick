// El login recibe a donde volver en ?volver=. Solo se aceptan rutas internas: "/compra/12/entradas" si,
// "//otro-sitio.com" o "/\otro-sitio.com" no, porque el navegador las toma como otro dominio.
export function rutaVolverSegura(valor) {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//') || valor.includes('\\')) return null;
  return valor;
}

export function rutaLogin(volver) {
  return `/login?volver=${encodeURIComponent(volver)}`;
}
