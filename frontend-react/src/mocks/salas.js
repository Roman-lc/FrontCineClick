// Los mismos planos que PlanoSala del backend. Cada texto es una fila, desde la pantalla hacia atras:
// "o" butaca, "D" lugar para silla de ruedas, "." pasillo o hueco.
const PLANOS = {
  CLASICA: [
    'DD..oooooooooo..DD',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
    'ooo.oooooooooo.ooo',
  ],
  ESTADIO: [
    '..oooooo.oooooo..',
    '.ooooooo.ooooooo.',
    'oooooooo.oooooooo',
    'oooooooo.oooooooo',
    'oooooooo.oooooooo',
    'oooooooo.oooooooo',
    'oooooooo.oooooooo',
    'oooooooo.oooooooo',
    'DDoooooo.ooooooDD',
  ],
  IMAX: [
    '......oooooooooo......',
    '...oo.oooooooooo.oo...',
    '.oooo.oooooooooo.oooo.',
    'ooooo.oooooooooo.ooooo',
    'ooooo.oooooooooo.ooooo',
    'ooooo.oooooooooo.ooooo',
    'ooooo.oooooooooo.ooooo',
    'ooooo.oooooooooo.ooooo',
    'ooooo.oooooooooo.ooooo',
    'DDooo.oooooooooo.oooDD',
  ],
  PREMIUM: ['DD.oooooo.DD', 'oo.oooooo.oo', 'oo.oooooo.oo', 'oo.oooooo.oo', 'oo.oooooo.oo', 'oo.oooooo.oo'],
  CUATRO_D: [
    'DD...oooo.oooo...DD',
    'oooo.oooo.oooo.oooo',
    'oooo.oooo.oooo.oooo',
    'oooo.oooo.oooo.oooo',
    'oooo.oooo.oooo.oooo',
    'oooo.oooo.oooo.oooo',
  ],
};

// salaId -> plano (ver cines.js)
const PLANO_DE_SALA = { 1: 'CLASICA', 2: 'IMAX', 3: 'ESTADIO', 4: 'PREMIUM', 5: 'CUATRO_D' };

// Misma forma que ButacaResponseDTO, sin "disponible" (lo agrega mocks/compras.js)
export function butacasDeSala(salaId) {
  const filas = PLANOS[PLANO_DE_SALA[salaId]] ?? [];
  const butacas = [];
  filas.forEach((texto, i) => {
    const fila = String.fromCharCode(65 + i);
    let numero = 0;
    [...texto].forEach((lugar, columna) => {
      if (lugar !== 'o' && lugar !== 'D') return;
      numero += 1;
      butacas.push({
        id: salaId * 1000 + butacas.length + 1,
        fila,
        numero,
        columna: columna + 1,
        codigo: `${fila}${numero}`,
        tipo: lugar === 'D' ? 'DISCAPACIDAD' : 'NORMAL',
      });
    });
  });
  return butacas;
}

export const capacidadDeSala = (salaId) => butacasDeSala(salaId).length;
