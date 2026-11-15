import { formatoTitulo, normalizarTelefono, texto } from '../../lib/normalizar';

export const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 120;
export const PASSWORD_MINIMA = 8;

export const GENEROS = [
  { valor: 'FEMENINO', texto: 'Femenino' },
  { valor: 'MASCULINO', texto: 'Masculino' },
  { valor: 'OTRO', texto: 'Otro' },
];

const SOLO_LETRAS = /^[\p{L}][\p{L}' -]*$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function nombrePropio(valor, campo) {
  const limpio = texto(valor);
  if (!limpio) return `Ingresá tu ${campo}`;
  if (limpio.length < 2) return `El ${campo} tiene que tener al menos 2 letras`;
  if (limpio.length > 50) return `El ${campo} puede tener hasta 50 caracteres`;
  if (!SOLO_LETRAS.test(limpio)) return `El ${campo} solo puede tener letras, espacios, guiones y apóstrofes`;
  return null;
}

function edad(fechaISO, hoy = new Date()) {
  const [a, m, d] = fechaISO.split('-').map(Number);
  let anios = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) anios--;
  return anios;
}

function fechaValida(fechaISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return false;
  const [a, m, d] = fechaISO.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
}

export function hoyLocalISO(hoy = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${hoy.getFullYear()}-${p(hoy.getMonth() + 1)}-${p(hoy.getDate())}`;
}

export function fechaMaximaNacimientoISO(hoy = new Date()) {
  const f = new Date(hoy.getFullYear() - EDAD_MINIMA, hoy.getMonth(), hoy.getDate());
  if (f.getMonth() !== hoy.getMonth()) f.setDate(0);
  return hoyLocalISO(f);
}

export function requisitosPassword(valor) {
  return [
    { id: 'largo', texto: `Al menos ${PASSWORD_MINIMA} caracteres`, ok: valor.length >= PASSWORD_MINIMA },
    { id: 'letra', texto: 'Al menos una letra', ok: /\p{L}/u.test(valor) },
    { id: 'numero', texto: 'Al menos un número', ok: /\d/.test(valor) },
  ];
}

export const VALIDADORES = {
  nombre: (v) => nombrePropio(v.nombre, 'nombre'),
  apellido: (v) => nombrePropio(v.apellido, 'apellido'),
  email: (v) => {
    const limpio = v.email.trim();
    if (!limpio) return 'Ingresá tu correo electrónico';
    if (!EMAIL.test(limpio)) return 'Revisá el correo: tiene que tener el formato nombre@dominio.com';
    if (limpio.length > 100) return 'El correo puede tener hasta 100 caracteres';
    return null;
  },
  fechaNacimiento: (v) => {
    if (!v.fechaNacimiento) return 'Ingresá tu fecha de nacimiento';
    if (!fechaValida(v.fechaNacimiento)) return 'La fecha no es válida';
    if (v.fechaNacimiento > hoyLocalISO()) return 'La fecha no puede ser posterior a hoy';
    const anios = edad(v.fechaNacimiento);
    if (anios < EDAD_MINIMA) return `Tenés que tener al menos ${EDAD_MINIMA} años para crear una cuenta`;
    if (anios > EDAD_MAXIMA) return 'Revisá el año de nacimiento';
    return null;
  },
  telefono: (v) => {
    const digitos = normalizarTelefono(v.telefono);
    if (digitos === null) return 'Ingresá tu número de teléfono';
    if (digitos === undefined) return 'Tiene que tener 10 dígitos con el código de área y sin el 15 (por ejemplo, 11 4000 1000)';
    return null;
  },
  cinePreferidoId: (v) => (v.cinePreferidoId ? null : 'Elegí tu complejo de preferencia'),
  genero: (v) => (v.genero ? null : 'Elegí una opción'),
  password: (v) => {
    if (!v.password) return 'Ingresá una contraseña';
    const faltan = requisitosPassword(v.password).filter((r) => !r.ok);
    if (faltan.length) return `A la contraseña le falta: ${faltan.map((r) => r.texto.toLowerCase()).join(', ')}`;
    return null;
  },
  passwordConfirm: (v) => {
    if (!v.passwordConfirm) return 'Repetí la contraseña';
    if (v.password !== v.passwordConfirm) return 'Las contraseñas no coinciden';
    return null;
  },
  aceptaTerminos: (v) => (v.aceptaTerminos ? null : 'Tenés que aceptar los términos y condiciones y la política de privacidad'),
};

export const CAMPOS = Object.keys(VALIDADORES);

export function validarRegistro(valores) {
  const errores = {};
  for (const campo of CAMPOS) {
    const error = VALIDADORES[campo](valores);
    if (error) errores[campo] = error;
  }
  return errores;
}

export function armarRegistro(v) {
  return {
    nombre: formatoTitulo(v.nombre),
    apellido: formatoTitulo(v.apellido),
    email: v.email.trim().toLowerCase(),
    fechaNacimiento: v.fechaNacimiento,
    telefono: normalizarTelefono(v.telefono),
    cinePreferidoId: Number(v.cinePreferidoId),
    genero: v.genero,
    password: v.password,
    aceptaTerminos: v.aceptaTerminos === true,
  };
}
