import { IconoTarjeta } from './iconos';

// Metodos que ofrece el selector del paso de pago. Para sumar uno nuevo alcanza con agregarlo aca
// (y el formulario que corresponda en PasoPago); el layout no cambia.
// metodoPago es el valor del enum MetodoPago del backend.
export const METODOS_PAGO = [
  {
    id: 'tarjeta',
    nombre: 'Tarjeta de crédito o débito',
    descripcion: 'Visa, Mastercard o American Express',
    metodoPago: 'TARJETA_CREDITO',
    Icono: IconoTarjeta,
  },
];
