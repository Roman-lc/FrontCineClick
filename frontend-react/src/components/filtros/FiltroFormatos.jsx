import Selector from '../ui/Selector';
import { ORDEN_FORMATOS, etiquetaFormato } from '../../lib/formato';

// Seleccion multiple de formatos (codigos del backend: DOS_D, IMAX...). Sin seleccion = todos.
export default function FiltroFormatos({ formatos, seleccionados, onCambiar }) {
  const ordenados = [...formatos].sort((a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b));
  return (
    <Selector
      multiple
      opciones={ordenados.map((f) => ({ valor: f, texto: etiquetaFormato(f) }))}
      valor={seleccionados}
      onCambiar={onCambiar}
      etiqueta={seleccionados.length ? `Formatos (${seleccionados.length})` : 'Formatos'}
      etiquetaAccesible="Formatos"
      activo={seleccionados.length > 0}
    />
  );
}
