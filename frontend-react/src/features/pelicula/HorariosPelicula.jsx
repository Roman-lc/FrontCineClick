import { Link } from 'react-router-dom';
import BarraSegmentos from '../../components/filtros/BarraSegmentos';
import FiltroFormatos from '../../components/filtros/FiltroFormatos';
import FiltroIdioma from '../../components/filtros/FiltroIdioma';
import EstadoVacio from '../../components/ui/EstadoVacio';
import IconoButaca from '../../components/ui/IconoButaca';
import SelectorCine from '../../components/ui/SelectorCine';
import { NIVELES_DISPONIBILIDAD, nivelDisponibilidad } from '../../lib/disponibilidad';
import { diaYFechaCortos, fechaDeFuncion, fechaLarga, funcionVigente, horaCorta, hoyISO } from '../../lib/fechas';
import { etiquetaFormato } from '../../lib/formato';
import {
  agruparPorFormatoEIdioma,
  cinePrincipal,
  diaInicial,
  diasDelSelector,
  funcionesVigentesDeCine,
} from './horarios';
import styles from './pelicula.module.css';

export default function HorariosPelicula({ pelicula, cines, funciones, filtros, onCambiar }) {
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
              ? `Se estrena el ${fechaLarga(pelicula.fechaEstreno)}.`
              : 'Esta película no tiene funciones programadas.'
          }
        />
      </div>
    );
  }

  const delCine = funcionesVigentesDeCine(funciones, cine.id);
  const dias = diasDelSelector();
  const dia = diaInicial(dias, delCine, filtros.dia);
  const formatos = [...new Set(delCine.map((f) => f.formato))];
  const idiomas = [...new Set(delCine.map((f) => f.idioma))].sort();
  const delDia = delCine.filter(
    (f) =>
      fechaDeFuncion(f) === dia &&
      (!filtros.formatos.length || filtros.formatos.includes(f.formato)) &&
      (!filtros.idioma || f.idioma === filtros.idioma)
  );
  const grupos = agruparPorFormatoEIdioma(delDia);
  const hayFiltros = filtros.formatos.length > 0 || Boolean(filtros.idioma);

  return (
    <div className={styles.horarios}>
      {encabezado}

      <div className={styles.dias} role="group" aria-label="Día">
        {dias.map((fecha) => {
          const { dia: nombre, fecha: corta } = diaYFechaCortos(fecha);
          return (
            <button
              key={fecha}
              type="button"
              className={styles.dia}
              aria-pressed={fecha === dia}
              onClick={() => onCambiar({ dia: fecha })}
            >
              <span className={styles.diaNombre}>{nombre}</span>
              <span className={styles.diaFecha}>{corta}</span>
            </button>
          );
        })}
      </div>

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
        <p className={styles.horariosEn}>
          <label htmlFor="cine-horarios">Horarios en</label>{' '}
          <SelectorCine
            id="cine-horarios"
            cines={cines}
            valor={String(cine.id)}
            onCambiar={(cineId) => onCambiar({ cineId })}
          />
        </p>
        {cine.direccion && (
          <p className={styles.direccion}>
            {cine.direccion}
            {cine.ciudad && `, ${cine.ciudad}`}
          </p>
        )}
      </div>

      {grupos.length === 0 ? (
        <EstadoVacio
          mensaje={
            hayFiltros
              ? `No hay funciones con los filtros elegidos para este día en ${cine.nombre}.`
              : `No hay funciones para este día en ${cine.nombre}.`
          }
        >
          {hayFiltros && (
            <button type="button" className="btn" onClick={() => onCambiar({ formatos: [], idioma: '' })}>
              Quitar filtros
            </button>
          )}
          <Link to="/cines">Ver otros cines</Link>
        </EstadoVacio>
      ) : (
        <div className={styles.grupos}>
          {grupos.map((grupo) => (
            <section key={`${grupo.formato}|${grupo.idioma}`} aria-label={`${etiquetaFormato(grupo.formato)}, ${grupo.idioma}`}>
              <h3 className={styles.grupoTitulo}>
                <strong>{etiquetaFormato(grupo.formato)}</strong> · {grupo.idioma.toUpperCase()}
              </h3>
              <ul className={styles.chips}>
                {grupo.funciones.map((funcion) => (
                  <li key={funcion.id}>
                    <ChipHorario funcion={funcion} />
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

function ChipHorario({ funcion }) {
  const hora = horaCorta(funcion.fechaHoraInicio);
  const nivel = nivelDisponibilidad(funcion);
  const contenido = (
    <>
      <span className={styles[nivel.clave]}>
        <IconoButaca />
      </span>
      {hora}hs
    </>
  );

  if (nivel.clave === 'completa') {
    return (
      <span className={`${styles.chip} ${styles.chipCompleta}`} aria-disabled="true" aria-label={`${hora}, completa`}>
        {contenido}
      </span>
    );
  }
  return (
    <Link
      to={`/compra/${funcion.id}`}
      className={styles.chip}
      aria-label={`Comprar para las ${hora}, disponibilidad ${nivel.etiqueta.toLowerCase()}`}
    >
      {contenido}
    </Link>
  );
}
