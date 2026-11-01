import { Link } from 'react-router-dom';
import BarraSegmentos from '../../components/filtros/BarraSegmentos';
import FiltroFormatos from '../../components/filtros/FiltroFormatos';
import FiltroIdioma from '../../components/filtros/FiltroIdioma';
import EstadoVacio from '../../components/ui/EstadoVacio';
import IconoButaca from '../../components/ui/IconoButaca';
import BadgeFormato from '../../components/ui/BadgeFormato';
import ChipHorario from '../../components/ui/ChipHorario';
import Selector from '../../components/ui/Selector';
import { NIVELES_DISPONIBILIDAD } from '../../lib/disponibilidad';
import { diaRelativo, fechaDeFuncion, fechaLarga, funcionVigente, hoyISO } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, nombreCine } from '../../lib/formato';
import { direccionCine, ubicacionCine } from '../cines/cines';
import BotonAviso from '../listaEspera/BotonAviso';
import { useListaEspera } from '../listaEspera/useListaEspera';
import {
  agruparPorFormatoEIdioma,
  cinePrincipal,
  diaInicial,
  diasDelSelector,
  funcionesVigentesDeCine,
} from './horarios';
import SelectorDias from './SelectorDias';
import styles from './pelicula.module.css';

export default function HorariosPelicula({ pelicula, cines, funciones, filtros, onCambiar, elegidaId, onElegir }) {
  const { anotadas, marcar } = useListaEspera();
  const vigentes = funciones.filter(funcionVigente);
  const cine = cinePrincipal(cines, vigentes, filtros.cineId);

  const encabezado = (
    <>
      <h2 className={styles.tituloGrande}>Horarios</h2>
      <Link to="/cines" className={`btn btn-sm ${styles.botonCines}`}>
        Ver la cartelera por cine ›
      </Link>
    </>
  );

  if (vigentes.length === 0 || !cine) {
    const proximoEstreno = pelicula.fechaEstreno && pelicula.fechaEstreno > hoyISO();
    return (
      <div className={styles.horarios}>
        {encabezado}
        <EstadoVacio
          mensaje={
            proximoEstreno
              ? `Se estrena el ${fechaLarga(pelicula.fechaEstreno)}. Las entradas todavía no están a la venta.`
              : 'Esta película no tiene funciones programadas.'
          }
        >
          {proximoEstreno ? (
            <BotonAviso pelicula={pelicula} anotada={anotadas.has(pelicula.id)} onCambio={marcar} />
          ) : (
            <Link to="/" className="btn btn-primary">
              Ver la cartelera
            </Link>
          )}
        </EstadoVacio>
      </div>
    );
  }

  const delCine = funcionesVigentesDeCine(funciones, cine.id);
  const dias = diasDelSelector(delCine);
  const dia = diaInicial(dias, delCine, filtros.dia);
  const formatos = [...new Set(delCine.map((f) => f.formato))];
  const idiomas = [...new Set(delCine.map((f) => f.idioma))].sort();
  const cumpleFiltros = (f) =>
    (!filtros.formatos.length || filtros.formatos.includes(f.formato)) && (!filtros.idioma || f.idioma === filtros.idioma);
  const delDia = delCine.filter((f) => fechaDeFuncion(f) === dia && cumpleFiltros(f));
  // Para el estado vacio: el proximo dia de la tira con funciones que cumplan los filtros
  const otroDia = dias.find((d) => d > dia && delCine.some((f) => fechaDeFuncion(f) === d && cumpleFiltros(f)));
  const grupos = agruparPorFormatoEIdioma(delDia);
  const hayFiltros = filtros.formatos.length > 0 || Boolean(filtros.idioma);

  return (
    <div className={styles.horarios}>
      {encabezado}

      <SelectorDias dias={dias} valor={dia} onCambiar={(fecha) => onCambiar({ dia: fecha })} />

      <BarraSegmentos etiqueta="Filtros de horarios">
        <FiltroFormatos formatos={formatos} seleccionados={filtros.formatos} onCambiar={(f) => onCambiar({ formatos: f })} />
        <FiltroIdioma idiomas={idiomas} seleccionado={filtros.idioma} onCambiar={(idioma) => onCambiar({ idioma })} />
      </BarraSegmentos>

      <div className={styles.leyenda}>
        <p className={styles.etiquetaChica}>Disponibilidad de butacas</p>
        <ul className={styles.leyendaItems}>
          {NIVELES_DISPONIBILIDAD.map(({ clave, etiqueta }) => (
            <li key={clave} className={styles[clave]}>
              <IconoButaca tamano={14} />
              <span>{etiqueta}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.cine}>
        <p className={styles.etiquetaChica}>Cine principal</p>
        <div className={styles.horariosEn}>
          <label htmlFor="cine-horarios">Horarios en</label>{' '}
          <Selector
            id="cine-horarios"
            variante="frase"
            opciones={cines.map((c) => ({ valor: String(c.id), texto: nombreCine(c.nombre) }))}
            valor={String(cine.id)}
            onCambiar={(cineId) => onCambiar({ cineId })}
          />
        </div>
        {cine.calle && (
          <p className={styles.direccion}>
            {direccionCine(cine)}, {ubicacionCine(cine)}
          </p>
        )}
      </div>

      {grupos.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltros ? 'No hay funciones con estos filtros' : 'No hay funciones para este día'}
          mensaje={otroDia ? `Probá con ${diaRelativo(otroDia).toLowerCase()} en ${nombreCine(cine.nombre)}.` : 'Probá con otro cine.'}
        >
          {otroDia && (
            <button type="button" className="btn btn-primary" onClick={() => onCambiar({ dia: otroDia })}>
              Ver {diaRelativo(otroDia).toLowerCase()}
            </button>
          )}
          {hayFiltros && (
            <button type="button" className="btn" onClick={() => onCambiar({ formatos: [], idioma: '' })}>
              Quitar filtros
            </button>
          )}
          <Link to="/cines" className="btn">
            Ver otros cines
          </Link>
        </EstadoVacio>
      ) : (
        <div className={styles.grupos}>
          {grupos.map((grupo) => (
            <section key={`${grupo.formato}|${grupo.idioma}`} aria-label={`${etiquetaFormato(grupo.formato)}, ${etiquetaIdioma(grupo.idioma)}`}>
              <h3 className={styles.grupoTitulo}>
                <BadgeFormato formato={grupo.formato} /> · {etiquetaIdioma(grupo.idioma).toUpperCase()}
              </h3>
              <ul className={styles.chips}>
                {grupo.funciones.map((funcion) => (
                  <li key={funcion.id}>
                    <ChipHorario funcion={funcion} elegida={funcion.id === elegidaId} onElegir={onElegir} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
