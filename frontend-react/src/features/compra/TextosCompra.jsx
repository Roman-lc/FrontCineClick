import { Link } from 'react-router-dom';

// Informacion fija del paso de pago. Los terminos y condiciones estan en features/institucional (una sola
// fuente para el modal y la pagina /terminos).
export function InformacionCompra() {
  return (
    <ul>
      <li>Presentá el código de cada entrada y tu DNI en el ingreso. Cada código sirve una sola vez.</li>
      <li>Las entradas de menor o jubilado requieren acreditar la condición al ingresar.</li>
      <li>
        Podés arrepentirte de la compra dentro de los 10 días corridos y hasta 60 minutos antes de la función, desde el{' '}
        <Link to="/arrepentimiento">botón de arrepentimiento</Link>.
      </li>
      <li>Te recomendamos llegar 15 minutos antes. Una vez empezada la función el ingreso puede no permitirse.</li>
    </ul>
  );
}
