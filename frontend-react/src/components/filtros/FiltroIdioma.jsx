import Selector from '../ui/Selector';
import { etiquetaIdioma } from '../../lib/formato';

// seleccionado = '' significa todos los idiomas
export default function FiltroIdioma({ idiomas, seleccionado, onCambiar }) {
  return (
    <Selector
      opciones={[{ valor: '', texto: 'Todos los idiomas' }, ...idiomas.map((i) => ({ valor: i, texto: etiquetaIdioma(i) }))]}
      valor={seleccionado}
      onCambiar={onCambiar}
      etiqueta={seleccionado ? etiquetaIdioma(seleccionado) : 'Idioma'}
      etiquetaAccesible="Idioma"
      activo={Boolean(seleccionado)}
    />
  );
}
