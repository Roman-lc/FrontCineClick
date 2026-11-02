import { ACTUALIZACION_TERMINOS, NOTA_LEGAL, SECCIONES_TERMINOS } from './contenidoTerminos';
import PaginaLectura from './PaginaLectura';

export default function TerminosPage() {
  return (
    <PaginaLectura
      titulo="Términos y condiciones"
      bajada="Las reglas para usar el sitio y comprar entradas, en lenguaje claro."
      actualizado={ACTUALIZACION_TERMINOS}
      secciones={SECCIONES_TERMINOS}
      notaFinal={NOTA_LEGAL}
    />
  );
}
