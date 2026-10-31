import Desplegable from '../../components/ui/Desplegable';
import BarraSegmentos from '../../components/filtros/BarraSegmentos';
import FiltroFormatos from '../../components/filtros/FiltroFormatos';
import FiltroIdioma from '../../components/filtros/FiltroIdioma';
import { cerrarSiFueMouse } from '../../components/filtros/cerrarSiFueMouse';
import { diaSemanaCorto, fechaCorta, hoyISO, sumarDiasISO } from '../../lib/fechas';
import { etiquetaGenero } from '../../lib/formato';
import styles from '../../components/filtros/filtros.module.css';

function etiquetaDia(fecha) {
  const hoy = hoyISO();
  const nombre = fecha === hoy ? 'Hoy' : fecha === sumarDiasISO(hoy, 1) ? 'Mañana' : diaSemanaCorto(fecha);
  return `${nombre} ${fechaCorta(fecha)}`;
}

const alternar = (lista, valor) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

export default function BarraFiltros({ filtros, opciones, dias, dia, onCambiar }) {
  const otrasActivas = filtros.generos.length + (filtros.soloEstrenos ? 1 : 0);

  return (
    <BarraSegmentos etiqueta="Filtros de la cartelera">
      <FiltroFormatos
        formatos={opciones.formatos}
        seleccionados={filtros.formatos}
        onCambiar={(formatos) => onCambiar({ formatos })}
      />
      <FiltroIdioma idiomas={opciones.idiomas} seleccionado={filtros.idioma} onCambiar={(idioma) => onCambiar({ idioma })} />

      <Desplegable etiqueta={otrasActivas ? `Otras opciones (${otrasActivas})` : 'Otras opciones'} activo={otrasActivas > 0}>
        <fieldset className={styles.opciones}>
          <legend className="visually-hidden">Estrenos</legend>
          <label className={styles.opcion}>
            <input
              type="checkbox"
              checked={filtros.soloEstrenos}
              onChange={() => onCambiar({ soloEstrenos: !filtros.soloEstrenos })}
            />
            Solo estrenos
          </label>
        </fieldset>
        <fieldset className={styles.opciones}>
          <legend className={styles.leyenda}>Género</legend>
          {opciones.generos.map((genero) => (
            <label key={genero} className={styles.opcion}>
              <input
                type="checkbox"
                checked={filtros.generos.includes(genero)}
                onChange={() => onCambiar({ generos: alternar(filtros.generos, genero) })}
              />
              {etiquetaGenero(genero)}
            </label>
          ))}
        </fieldset>
      </Desplegable>

      <Desplegable etiqueta={etiquetaDia(dia)}>
        {(cerrar) => (
          <fieldset className={styles.opciones}>
            <legend className="visually-hidden">Día</legend>
            {dias.map(({ fecha, tieneFunciones }) => (
              <label key={fecha} className={`${styles.opcion} ${tieneFunciones ? '' : styles.opcionDeshabilitada}`}>
                <input
                  type="radio"
                  name="dia"
                  checked={fecha === dia}
                  disabled={!tieneFunciones}
                  onChange={() => onCambiar({ dia: fecha })}
                  onClick={cerrarSiFueMouse(cerrar)}
                />
                {etiquetaDia(fecha)}
                {!tieneFunciones && <span className={styles.notaOpcion}>sin funciones</span>}
              </label>
            ))}
          </fieldset>
        )}
      </Desplegable>
    </BarraSegmentos>
  );
}
