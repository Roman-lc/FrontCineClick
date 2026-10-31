// Validaciones de los datos de la tarjeta. Nada de esto sale del navegador: al backend solo
// llegan la marca y los ultimos 4 digitos (el pago es simulado).

export const MARCAS = [
  { id: 'amex', nombre: 'American Express', patron: /^3[47]/, largo: 15, largoCodigo: 4 },
  { id: 'visa', nombre: 'Visa', patron: /^4/, largo: 16, largoCodigo: 3 },
  { id: 'mastercard', nombre: 'Mastercard', patron: /^(5[1-5]|2[2-7])/, largo: 16, largoCodigo: 3 },
];

export const soloDigitos = (texto) => texto.replace(/\D/g, '');

export function detectarMarca(digitos) {
  return MARCAS.find((marca) => marca.patron.test(digitos)) ?? null;
}

// "4111111111111111" -> "4111 1111 1111 1111"
export function formatearNumeroTarjeta(digitos) {
  return digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function largoMaximoNumero(marca) {
  return marca?.largo ?? 16;
}

// Algoritmo de Luhn: detecta numeros mal tipeados (un digito cambiado o dos invertidos)
export function pasaLuhn(digitos) {
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    let digito = Number(digitos[digitos.length - 1 - i]);
    if (i % 2 === 1) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
  }
  return digitos.length > 0 && suma % 10 === 0;
}

// Se guardan solo los digitos ("0528") y la barra se agrega al mostrar ("05/28").
// Si el primer digito no puede ser decena de mes (2 a 9), se completa con 0: "4" -> "04".
export function normalizarVencimiento(texto) {
  let digitos = soloDigitos(texto).slice(0, 4);
  if (digitos.length === 1 && digitos > '1') digitos = `0${digitos}`;
  return digitos;
}

export function formatearVencimiento(digitos) {
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

export function validarNumeroTarjeta(digitos) {
  if (!digitos) return 'Ingresá el número de tarjeta.';
  const marca = detectarMarca(digitos);
  if (!marca) return 'Aceptamos Visa, Mastercard y American Express.';
  if (digitos.length !== marca.largo || !pasaLuhn(digitos)) return 'El número de tarjeta no es válido.';
  return '';
}

export function validarVencimiento(digitos, hoy = new Date()) {
  if (!digitos) return 'Ingresá el vencimiento.';
  const mes = Number(digitos.slice(0, 2));
  if (digitos.length !== 4 || mes < 1 || mes > 12) return 'El vencimiento no es válido. Usá el formato MM/AA.';
  const anio = 2000 + Number(digitos.slice(2));
  // La tarjeta sirve hasta el ultimo dia del mes que figura
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
    return 'La tarjeta está vencida.';
  }
  return '';
}

export function validarCodigoSeguridad(codigo, marca) {
  const largo = marca?.largoCodigo ?? 3;
  if (!codigo) return 'Ingresá el código de seguridad.';
  if (codigo.length !== largo) return `El código de seguridad tiene ${largo} dígitos.`;
  return '';
}

export function validarTitular(texto) {
  const nombre = texto.trim();
  if (!nombre) return 'Ingresá el nombre como figura en la tarjeta.';
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(nombre)) return 'Usá solo letras y espacios, como figura en la tarjeta.';
  if (nombre.length < 3) return 'Ingresá el nombre completo como figura en la tarjeta.';
  return '';
}

export function validarDni(dni) {
  if (!dni) return 'Ingresá el DNI del titular.';
  if (dni.length < 7 || dni.length > 8) return 'El DNI tiene 7 u 8 números.';
  return '';
}
