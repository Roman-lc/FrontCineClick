const CLAVE = 'cineclick_promo';

export function guardarPromo(codigo) {
  try {
    sessionStorage.setItem(CLAVE, codigo);
  } catch {}
}

export function leerPromoGuardada() {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function borrarPromoGuardada() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {}
}
