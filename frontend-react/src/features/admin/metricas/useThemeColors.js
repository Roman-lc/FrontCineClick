import { useState } from 'react';

// Colores de los tokens del tema admin para los graficos. Recharts dibuja SVG y sus atributos fill y
// stroke no aceptan var(--token), asi que se leen los valores reales con getComputedStyle desde el
// contenedor con data-theme="admin" (si cambian los tokens, los graficos cambian solos).
const TOKENS = {
  texto: '--text',
  textoSecundario: '--text-muted',
  borde: '--border',
  bordeInput: '--border-input',
  superficie: '--surface',
  superficie2: '--surface-2',
  exito: '--success',
  peligro: '--danger',
  media: '--avail-media',
};

function leerColores() {
  const contenedor = document.querySelector('[data-theme="admin"]') ?? document.documentElement;
  const estilos = getComputedStyle(contenedor);
  return Object.fromEntries(Object.entries(TOKENS).map(([nombre, token]) => [nombre, estilos.getPropertyValue(token).trim()]));
}

// Los graficos se dibujan dentro del layout del panel, que ya esta montado: se leen al crear el estado
export function useThemeColors() {
  const [colores] = useState(leerColores);
  return colores;
}
