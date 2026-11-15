import { useState } from 'react';

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

export function useThemeColors() {
  const [colores] = useState(leerColores);
  return colores;
}
