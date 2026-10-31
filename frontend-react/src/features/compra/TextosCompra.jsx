// Textos fijos del paso de pago. Son genericos y propios del proyecto.

export function TerminosYCondiciones() {
  return (
    <>
      <h3>1. Objeto</h3>
      <p>
        Estos términos regulan la compra de entradas en CineClick. Al confirmar el pago aceptás las condiciones de la función
        elegida (película, cine, sala, día, horario y butacas).
      </p>
      <h3>2. Precio y pago</h3>
      <p>
        El precio final es el que figura en el resumen al momento de pagar e incluye los descuentos aplicados. Las entradas con
        descuento (menores y jubilados) requieren acreditar la condición en el ingreso; si no se acredita, se puede pedir
        abonar la diferencia con la entrada general.
      </p>
      <h3>3. Reserva</h3>
      <p>
        Las butacas quedan reservadas durante 8 minutos para completar el pago. Si el tiempo se cumple, la reserva se cancela y
        las butacas vuelven a estar disponibles.
      </p>
      <h3>4. Cambios y cancelaciones</h3>
      <p>
        Las entradas pueden cancelarse hasta 2 horas antes del inicio de la función. Pasado ese plazo no se aceptan cambios ni
        devoluciones, salvo que la función se cancele: en ese caso se reintegra el importe completo por el mismo medio de pago.
      </p>
      <h3>5. Ingreso a la sala</h3>
      <p>
        Para ingresar hay que presentar el código de cada entrada y un documento. Cada código se puede usar una sola vez. Una
        vez comenzada la función, el ingreso queda sujeto a disponibilidad y puede no permitirse.
      </p>
      <h3>6. Datos personales</h3>
      <p>
        Usamos tus datos solo para gestionar la compra y, si lo autorizás, para enviarte novedades. Los datos completos de la
        tarjeta no se guardan.
      </p>
    </>
  );
}

export function InformacionCompra() {
  return (
    <ul>
      <li>Presentá el código de cada entrada y tu DNI en el ingreso. Cada código sirve una sola vez.</li>
      <li>Las entradas de menor o jubilado requieren acreditar la condición al ingresar.</li>
      <li>Podés cancelar la compra hasta 2 horas antes del inicio de la función.</li>
      <li>Te recomendamos llegar 15 minutos antes. Una vez empezada la función el ingreso puede no permitirse.</li>
    </ul>
  );
}
