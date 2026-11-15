import { fechaDeFuncion, funcionVigente, hoyISO, sumarDiasISO } from '../../lib/fechas';

export const DIAS_EN_SELECTOR = 5;

const ORDEN_FORMATOS = ['DOS_D', 'TRES_D', 'CUATRO_D', 'IMAX'];

export function diasDelSelector(funcionesDelCine = [], hoy = hoyISO()) {
  const primera = funcionesDelCine.map(fechaDeFuncion).sort()[0];
  const desde = primera && primera > hoy ? primera : hoy;
  return Array.from({ length: DIAS_EN_SELECTOR }, (_, i) => sumarDiasISO(desde, i));
}

export function cinePrincipal(cines, funcionesVigentes, cineIdPedido) {
  const pedido = cines.find((c) => String(c.id) === cineIdPedido);
  if (pedido) return pedido;
  const conFunciones = new Set(funcionesVigentes.map((f) => f.cineId));
  return cines.find((c) => conFunciones.has(c.id)) ?? cines[0] ?? null;
}

export function diaInicial(dias, funcionesDelCine, diaPedido) {
  if (dias.includes(diaPedido)) return diaPedido;
  const conFunciones = new Set(funcionesDelCine.map(fechaDeFuncion));
  return dias.find((d) => conFunciones.has(d)) ?? dias[0];
}

export function funcionesVigentesDeCine(funciones, cineId) {
  return funciones.filter((f) => funcionVigente(f) && f.cineId === cineId);
}

export function agruparPorFormatoEIdioma(funciones) {
  const grupos = new Map();
  for (const f of [...funciones].sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))) {
    const clave = `${f.formato}|${f.idioma}`;
    if (!grupos.has(clave)) grupos.set(clave, { formato: f.formato, idioma: f.idioma, funciones: [] });
    grupos.get(clave).funciones.push(f);
  }
  return [...grupos.values()].sort(
    (a, b) => ORDEN_FORMATOS.indexOf(a.formato) - ORDEN_FORMATOS.indexOf(b.formato) || a.idioma.localeCompare(b.idioma)
  );
}
