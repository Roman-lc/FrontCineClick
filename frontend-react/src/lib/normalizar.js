const CONECTORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e']);

export function texto(valor) {
  if (valor == null) return null;
  const limpio = String(valor)
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
  return limpio || null;
}

export function formatoTitulo(valor) {
  const limpio = texto(valor);
  if (!limpio) return null;
  return limpio
    .split(' ')
    .map((palabra, i) => {
      const minuscula = palabra.toLowerCase();
      const mayuscula = palabra === palabra.toUpperCase();
      const sigla = mayuscula && palabra.length <= 4;
      if (palabra !== minuscula && (!mayuscula || sigla)) return palabra;
      if (i > 0 && CONECTORES.has(minuscula)) return minuscula;
      return minuscula.charAt(0).toUpperCase() + minuscula.slice(1);
    })
    .join(' ');
}

export function clave(valor) {
  return (texto(valor) ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function normalizarTelefono(valor) {
  let digitos = String(valor ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.length === 13 && digitos.startsWith('549')) digitos = digitos.slice(3);
  else if (digitos.length === 12 && digitos.startsWith('54')) digitos = digitos.slice(2);
  else if (digitos.length === 11 && digitos.startsWith('0')) digitos = digitos.slice(1);
  return digitos.length === 10 ? digitos : undefined;
}

function maximoDigitosTelefono(digitos) {
  if (digitos.startsWith('549')) return 13;
  if (digitos.startsWith('54')) return 12;
  if (digitos.startsWith('0')) return 11;
  return 10;
}

export function limitarTelefono(valor) {
  let digitos = '';
  let resultado = '';
  for (const c of String(valor ?? '')) {
    if (/\d/.test(c)) {
      if (digitos.length + 1 > maximoDigitosTelefono(digitos + c)) continue;
      digitos += c;
      resultado += c;
    } else if (/[\s+().-]/.test(c)) {
      resultado += c;
    }
  }
  return resultado;
}

export function formatearTelefono(digitos) {
  if (!digitos) return '';
  if (!/^\d{10}$/.test(digitos)) return digitos;
  if (digitos.startsWith('11')) return `0${digitos.slice(0, 2)}-${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `0${digitos.slice(0, 3)}-${digitos.slice(3, 6)}-${digitos.slice(6)}`;
}
