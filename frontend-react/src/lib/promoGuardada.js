// Codigo de promocion elegido con "Usar en mi compra": se guarda en sessionStorage y el paso de pago
// lo aplica solo al cargar.
const CLAVE = 'cineclick_promo';

export function guardarPromo(codigo) {
  try {
    sessionStorage.setItem(CLAVE, codigo);
  } catch {
    // Sin storage, el codigo se puede escribir a mano en el pago
  }
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
  } catch {
    // Nada que borrar
  }
}
