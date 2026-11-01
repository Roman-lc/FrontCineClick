// Formatos del panel de metricas (es-AR): "$ 1.234.567", "66,7 %", "12.345"

const PESOS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const PORCENTAJE = new Intl.NumberFormat('es-AR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const MILES = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export const pesos = (valor) => PESOS.format(Number(valor ?? 0));
export const porcentaje = (fraccion) => PORCENTAJE.format(Number(fraccion ?? 0));
export const miles = (valor) => MILES.format(Number(valor ?? 0));

// Variacion contra el periodo anterior. null si no hay con que comparar (el anterior es 0).
export function variacion({ valor, valorAnterior }) {
  const anterior = Number(valorAnterior ?? 0);
  if (!anterior) return null;
  return (Number(valor ?? 0) - anterior) / anterior;
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
