// Mismas reglas de normalizacion que el backend (Normalizador.java), para mostrar los errores antes de
// enviar y que lo que se ve en el formulario sea lo que se va a guardar.

const CONECTORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e']);

// Trim y espacios multiples colapsados a uno (los saltos de linea se respetan). Vacio -> null.
export function texto(valor) {
  if (valor == null) return null;
  const limpio = String(valor)
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
  return limpio || null;
}

// "san isidro" -> "San Isidro", "villa del parque" -> "Villa del Parque". Las palabras con mayusculas y
// minusculas mezcladas ("CineClick") y las siglas cortas ("IMAX", "4D") quedan como estan.
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

// Para comparar nombres sin distinguir mayusculas ni tildes
export function clave(valor) {
  return (texto(valor) ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// Acepta cualquier formato ("011 4000-1000", "+54 11 4000 1000") y devuelve los 10 digitos con el codigo
// de area, o null si queda vacio. Si no llega a 10 digitos devuelve undefined (dato invalido).
export function normalizarTelefono(valor) {
  let digitos = String(valor ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.length === 13 && digitos.startsWith('549')) digitos = digitos.slice(3);
  else if (digitos.length === 12 && digitos.startsWith('54')) digitos = digitos.slice(2);
  else if (digitos.length === 11 && digitos.startsWith('0')) digitos = digitos.slice(1);
  return digitos.length === 10 ? digitos : undefined;
}

// "1140001000" -> "011-4000-1000". El area 11 (AMBA) tiene 2 digitos; para el resto se asume un codigo de
// 3 digitos ("3514000100" -> "0351-400-0100"), que es el caso mas comun.
export function formatearTelefono(digitos) {
  if (!digitos) return '';
  if (!/^\d{10}$/.test(digitos)) return digitos;
  if (digitos.startsWith('11')) return `0${digitos.slice(0, 2)}-${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `0${digitos.slice(0, 3)}-${digitos.slice(3, 6)}-${digitos.slice(6)}`;
}
