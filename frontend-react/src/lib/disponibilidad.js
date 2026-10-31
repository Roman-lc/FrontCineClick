export const NIVELES_DISPONIBILIDAD = [
  { clave: 'alta', etiqueta: 'Alta' },
  { clave: 'media', etiqueta: 'Media' },
  { clave: 'baja', etiqueta: 'Baja' },
  { clave: 'completa', etiqueta: 'Completa' },
];

export function nivelDisponibilidad({ butacasLibres, capacidadSala }) {
  if (!butacasLibres) return NIVELES_DISPONIBILIDAD[3];
  if (!capacidadSala) return NIVELES_DISPONIBILIDAD[0];
  const libre = butacasLibres / capacidadSala;
  if (libre > 0.5) return NIVELES_DISPONIBILIDAD[0];
  if (libre >= 0.2) return NIVELES_DISPONIBILIDAD[1];
  return NIVELES_DISPONIBILIDAD[2];
}
