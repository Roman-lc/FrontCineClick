import BarraSegmentos from '../../components/filtros/BarraSegmentos';
import FiltroFormatos from '../../components/filtros/FiltroFormatos';
import FiltroIdioma from '../../components/filtros/FiltroIdioma';
import Selector from '../../components/ui/Selector';
import { diaSemanaCorto, fechaCorta, hoyISO, sumarDiasISO } from '../../lib/fechas';
import { etiquetaGenero } from '../../lib/formato';

function etiquetaDia(fecha) {
  const hoy = hoyISO();
  const nombre = fecha === hoy ? 'Hoy' : fecha === sumarDiasISO(hoy, 1) ? 'Mañana' : diaSemanaCorto(fecha);
  return `${nombre} ${fechaCorta(fecha)}`;
}

export default function BarraFiltros({ filtros, opciones, dias, dia, onCambiar }) {
  return (
    <BarraSegmentos etiqueta="Filtros de la cartelera">
      <FiltroFormatos formatos={opciones.formatos} seleccionados={filtros.formatos} onCambiar={(formatos) => onCambiar({ formatos })} />
      <FiltroIdioma idiomas={opciones.idiomas} seleccionado={filtros.idioma} onCambiar={(idioma) => onCambiar({ idioma })} />
      <Selector
        multiple
        opciones={opciones.generos.map((g) => ({ valor: g, texto: etiquetaGenero(g) }))}
        valor={filtros.generos}
        onCambiar={(generos) => onCambiar({ generos })}
        etiqueta={filtros.generos.length ? `Género (${filtros.generos.length})` : 'Género'}
        etiquetaAccesible="Género"
        activo={filtros.generos.length > 0}
      />
      <Selector
        opciones={dias.map(({ fecha, tieneFunciones }) => ({
          valor: fecha,
          texto: etiquetaDia(fecha),
          deshabilitada: !tieneFunciones,
          nota: tieneFunciones ? undefined : 'sin funciones',
        }))}
        valor={dia}
        onCambiar={(fecha) => onCambiar({ dia: fecha })}
        etiquetaAccesible="Día"
      />
    </BarraSegmentos>
  );
}
