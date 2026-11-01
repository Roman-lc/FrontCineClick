const TIPOS_SALA = { TRADICIONAL: 'Tradicional', PREMIUM: 'Premium', IMAX: 'IMAX', CUATRO_D: '4D' };

// { nombre: 'Sala IMAX', tipo: 'IMAX', capacidad: 182 } -> "Sala IMAX · 182 butacas"
// Si el nombre no dice el tipo (ej. "Sala 1", TRADICIONAL) se agrega: "Sala 1 · Tradicional · 142 butacas"
export function etiquetaSala(sala) {
  const tipo = TIPOS_SALA[sala.tipo] ?? sala.tipo;
  const partes = [sala.nombre];
  if (!sala.nombre.toLowerCase().includes(tipo.toLowerCase())) partes.push(tipo);
  if (sala.capacidad) partes.push(`${sala.capacidad} butacas`);
  return partes.join(' · ');
}
