import { useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import admin from '../../../components/admin/admin.module.css';
import EstadoError from '../../../components/ui/EstadoError';
import EstadoVacio from '../../../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../../../components/ui/Esqueletos';
import { fechaDeFuncion, horaCorta, hoyISO, sumarDiasISO } from '../../../lib/fechas';
import { nombreCine } from '../../../lib/formato';
import { getMetricas } from '../../../services/admin';
import { getCines } from '../../../services/cines';
import { DIAS_SEMANA, miles, pesos, porcentaje, variacion } from './formato';
import { RankingPeliculas, TiposEntrada } from './graficos';
import styles from './metricas.module.css';

const PERIODOS = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: '7d', texto: '7 días' },
  { valor: '30d', texto: '30 días' },
  { valor: 'personalizado', texto: 'Personalizado' },
];

// Filtros en la URL: ?periodo=7d&desde=2026-10-01&hasta=2026-10-31&cine=3
function leerFiltros(params) {
  const periodo = PERIODOS.some((p) => p.valor === params.get('periodo')) ? params.get('periodo') : '7d';
  const hoy = hoyISO();
  let desde = hoy;
  let hasta = hoy;
  if (periodo === '7d') desde = sumarDiasISO(hoy, -6);
  if (periodo === '30d') desde = sumarDiasISO(hoy, -29);
  if (periodo === 'personalizado') {
    desde = params.get('desde') || sumarDiasISO(hoy, -6);
    hasta = params.get('hasta') || hoy;
  }
  return { periodo, desde, hasta, cine: params.get('cine') ?? '' };
}

function haceCuanto(fecha, ahora) {
  if (!fecha) return '';
  const minutos = Math.floor((ahora - fecha) / 60000);
  if (minutos < 1) return 'Actualizado hace menos de 1 min';
  return `Actualizado hace ${minutos} min`;
}

export default function MetricasPage() {
  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const rangoInvalido = filtros.desde > filtros.hasta;
  const [cines, setCines] = useState([]);
  const [version, setVersion] = useState(0);
  // estado.consulta dice a que filtros corresponden los datos: si no coincide con la actual, esta cargando
  const [estado, setEstado] = useState({ consulta: null, error: false, datos: null, actualizado: null });
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    getCines()
      .then(setCines)
      .catch(() => setCines([]));
  }, []);

  const consulta = `${filtros.desde}|${filtros.hasta}|${filtros.cine}|${version}`;
  const cargando = !rangoInvalido && estado.consulta !== consulta;

  useEffect(() => {
    if (rangoInvalido) return undefined;
    let ignorar = false;
    getMetricas({ desde: filtros.desde, hasta: filtros.hasta, cineId: filtros.cine })
      .then((datos) => !ignorar && setEstado({ consulta, error: false, datos, actualizado: Date.now() }))
      .catch(() => !ignorar && setEstado({ consulta, error: true, datos: null, actualizado: null }));
    return () => {
      ignorar = true;
    };
  }, [consulta, rangoInvalido]); // eslint-disable-line react-hooks/exhaustive-deps

  // Solo se refresca el texto "Actualizado hace N min"; los datos no se recargan solos
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cambiar = (cambios) =>
    setParams(
      (actuales) => {
        const nuevos = new URLSearchParams(actuales);
        for (const [clave, valor] of Object.entries(cambios)) {
          if (valor) nuevos.set(clave, valor);
          else nuevos.delete(clave);
        }
        return nuevos;
      },
      { replace: true },
    );

  const elegirPeriodo = (periodo) => {
    if (periodo === 'personalizado') cambiar({ periodo, desde: filtros.desde, hasta: filtros.hasta });
    else cambiar({ periodo, desde: '', hasta: '' });
  };

  const actualizar = () => {
    setAhora(Date.now());
    setVersion((v) => v + 1);
  };

  const { datos: datosGuardados } = estado;
  const datos = cargando ? null : datosGuardados;
  const carga = { cargando, error: !cargando && estado.error, onReintentar: actualizar };

  return (
    <section>
      <title>Métricas | Panel | CineClick</title>
      <div className={styles.encabezado}>
        <div>
          <h1 className={admin.titulo}>Métricas</h1>
          <p className={styles.actualizado} aria-live="polite">
            {haceCuanto(estado.actualizado, ahora)}
            <button type="button" className="btn btn-sm" onClick={actualizar} disabled={cargando}>
              Actualizar
            </button>
          </p>
        </div>

        <div className={styles.filtros}>
          <div className={admin.segmentos} role="group" aria-label="Período">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                type="button"
                className={admin.segmento}
                aria-pressed={filtros.periodo === p.valor}
                onClick={() => elegirPeriodo(p.valor)}
              >
                {p.texto}
              </button>
            ))}
          </div>
          <select
            className={`${admin.control} ${styles.selectCine}`}
            aria-label="Cine"
            value={filtros.cine}
            onChange={(e) => cambiar({ cine: e.target.value })}
          >
            <option value="">Todos los cines</option>
            {cines.map((c) => (
              <option key={c.id} value={c.id}>
                {nombreCine(c.nombre)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtros.periodo === 'personalizado' && (
        <div className={styles.fechas}>
          <label className={styles.fecha}>
            Desde
            <input
              type="date"
              className={admin.control}
              value={filtros.desde}
              max={filtros.hasta}
              onChange={(e) => e.target.value && cambiar({ desde: e.target.value })}
            />
          </label>
          <label className={styles.fecha}>
            Hasta
            <input
              type="date"
              className={admin.control}
              value={filtros.hasta}
              min={filtros.desde}
              onChange={(e) => e.target.value && cambiar({ hasta: e.target.value })}
            />
          </label>
          {rangoInvalido && (
            <p className={admin.error} role="alert" data-icono="error">
              La fecha de inicio no puede ser posterior a la de fin.
            </p>
          )}
        </div>
      )}

      {/* Fila 1: indicadores */}
      <div className={styles.indicadores}>
        <Indicador etiqueta="Ingresos" indicador={datos?.resumen.ingresos} formato={pesos} carga={carga} />
        <Indicador
          etiqueta="Entradas vendidas"
          indicador={datos?.resumen.entradasVendidas}
          formato={miles}
          carga={carga}
        />
        <Indicador etiqueta="Ocupación" indicador={datos?.resumen.ocupacion} formato={porcentaje} carga={carga} />
        <Indicador etiqueta="Ticket promedio" indicador={datos?.resumen.ticketPromedio} formato={pesos} carga={carga} />
      </div>

      {/* Fila 2 */}
      <div className={styles.dosColumnas}>
        <Bloque
          titulo="Próximas funciones"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={4} alto={44} etiqueta="Cargando funciones" />}
          vacio={
            datos &&
            !datos.proximasFunciones.length && {
              titulo: 'No hay funciones hoy ni mañana',
              mensaje: 'Programá funciones desde la sección Funciones.',
            }
          }
        >
          {datos && <ProximasFunciones funciones={datos.proximasFunciones} />}
        </Bloque>
        <Bloque
          titulo="Conversión del checkout"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={1} alto={150} etiqueta="Cargando conversión" />}
          vacio={
            datos &&
            !datos.conversion.creadas && {
              titulo: 'Sin reservas en este período',
              mensaje: 'Cuando alguien empiece una compra, la vas a ver acá.',
            }
          }
        >
          {datos && <Conversion conversion={datos.conversion} />}
        </Bloque>
      </div>

      {/* Fila 3 */}
      <div className={styles.dosColumnas}>
        <Bloque
          titulo="Ranking de películas"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={1} alto={240} etiqueta="Cargando ranking" />}
          vacio={datos && !datos.rankingPeliculas.length && { titulo: 'Sin ventas en este período' }}
        >
          {datos && <RankingPeliculas ranking={datos.rankingPeliculas} />}
        </Bloque>
        <Bloque
          titulo="Tipos de entrada"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={1} alto={200} etiqueta="Cargando tipos de entrada" />}
          vacio={datos && !datos.tiposEntrada.length && { titulo: 'Sin ventas en este período' }}
        >
          {datos && <TiposEntrada tipos={datos.tiposEntrada} />}
        </Bloque>
      </div>

      {/* Fila 4 */}
      <Bloque
        titulo="Ventas por franja"
        carga={carga}
        esqueleto={<EsqueletoFilas cantidad={1} alto={240} etiqueta="Cargando franjas" />}
        vacio={
          datos &&
          !datos.franjas.length && {
            titulo: 'Sin entradas para funciones de este período',
            mensaje: 'La grilla cuenta las entradas por día y hora de la función.',
          }
        }
      >
        {datos && <MapaDeCalor franjas={datos.franjas} />}
      </Bloque>

      {/* Fila 5 */}
      <div className={filtros.cine ? '' : styles.dosColumnas}>
        {!filtros.cine && (
          <Bloque
            titulo="Por cine"
            carga={carga}
            esqueleto={<EsqueletoFilas cantidad={3} alto={40} etiqueta="Cargando cines" />}
            vacio={datos && !datos.porCine.length && { titulo: 'Sin ventas en este período' }}
          >
            {datos && <PorCine cines={datos.porCine} />}
          </Bloque>
        )}
        <Bloque
          titulo="Promociones"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={3} alto={40} etiqueta="Cargando promociones" />}
          vacio={datos && !datos.promociones.length && { titulo: 'No se usaron promociones en este período' }}
        >
          {datos && <Promociones promociones={datos.promociones} />}
        </Bloque>
      </div>

      {/* Fila 6 */}
      <div className={styles.dosColumnas}>
        <Bloque
          titulo="Asistencia"
          carga={carga}
          esqueleto={<EsqueletoFilas cantidad={1} alto={110} etiqueta="Cargando asistencia" />}
          vacio={
            datos &&
            !datos.asistencia.emitidas && {
              titulo: 'Sin funciones pasadas con entradas',
              mensaje: 'Se calcula con las funciones del período que ya empezaron.',
            }
          }
        >
          {datos && <Asistencia asistencia={datos.asistencia} />}
        </Bloque>
      </div>
    </section>
  );
}

// Contenedor de cada bloque: titulo y, segun el estado, esqueleto, error, vacio o el contenido
function Bloque({ titulo, carga, esqueleto, vacio, children }) {
  const id = useId();
  let contenido = children;
  if (carga.cargando) contenido = esqueleto;
  else if (carga.error)
    contenido = (
      <EstadoError
        titulo={`No pudimos cargar: ${titulo.toLowerCase()}`}
        mensaje="Revisá la conexión con el servidor."
        onReintentar={carga.onReintentar}
      />
    );
  else if (vacio) contenido = <EstadoVacio titulo={vacio.titulo} mensaje={vacio.mensaje} />;
  return (
    <section className={styles.bloque} aria-labelledby={id} aria-busy={carga.cargando}>
      <h2 id={id} className={styles.bloqueTitulo}>
        {titulo}
      </h2>
      {contenido}
    </section>
  );
}

function Indicador({ etiqueta, indicador, formato, carga }) {
  if (carga.cargando) return <EsqueletoFilas cantidad={1} alto={118} etiqueta={`Cargando ${etiqueta.toLowerCase()}`} />;
  if (carga.error || !indicador) {
    return (
      <div className={styles.indicador}>
        <p className={styles.indicadorEtiqueta}>{etiqueta}</p>
        <p className={styles.indicadorValor}>—</p>
        <p className={styles.sinComparacion}>No se pudo cargar</p>
      </div>
    );
  }
  const cambio = variacion(indicador);
  return (
    <div className={styles.indicador}>
      <p className={styles.indicadorEtiqueta}>{etiqueta}</p>
      <p className={styles.indicadorValor}>{formato(indicador.valor)}</p>
      {cambio === null ? (
        <p className={styles.sinComparacion}>Sin datos del período anterior</p>
      ) : (
        <p className={`${styles.variacion} ${cambio > 0 ? styles.sube : cambio < 0 ? styles.baja : ''}`}>
          {cambio !== 0 && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {cambio > 0 ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
            </svg>
          )}
          <span>
            {cambio > 0 ? '+' : cambio < 0 ? '−' : ''}
            {porcentaje(Math.abs(cambio))} vs. período anterior
          </span>
        </p>
      )}
    </div>
  );
}

function BarraOcupacion({ fraccion }) {
  return (
    <span className={styles.barra} aria-hidden="true">
      <span className={styles.barraRelleno} style={{ width: `${Math.min(100, fraccion * 100)}%` }} />
    </span>
  );
}

function ProximasFunciones({ funciones }) {
  const hoy = hoyISO();
  const grupos = [
    { titulo: 'Hoy', funciones: funciones.filter((f) => fechaDeFuncion({ fechaHoraInicio: f.inicio }) === hoy) },
    { titulo: 'Mañana', funciones: funciones.filter((f) => fechaDeFuncion({ fechaHoraInicio: f.inicio }) !== hoy) },
  ].filter((g) => g.funciones.length);

  return (
    <>
      <div
        className={styles.proximas}
        tabIndex={0}
        role="region"
        aria-label={`${funciones.length} funciones de hoy y mañana`}
      >
        {grupos.map((grupo) => (
          <div key={grupo.titulo} className={styles.grupoFunciones}>
            <h3 className={styles.grupoTitulo}>{grupo.titulo}</h3>
            <ul className={styles.listaFunciones}>
              {grupo.funciones.map((f) => {
                const fraccion = f.capacidad ? f.vendidas / f.capacidad : 0;
                const badge = fraccion >= 1 ? 'Agotada' : fraccion >= 0.8 ? 'Casi llena' : null;
                return (
                  <li key={f.funcionId}>
                    <Link to={`/admin/funciones?funcion=${f.funcionId}`} className={styles.filaFuncion}>
                      <span className={styles.horaFuncion}>{horaCorta(f.inicio)}</span>
                      <span className={styles.datosFuncion}>
                        <span className={styles.peliculaFuncion}>{f.pelicula}</span>
                        <span className={styles.secundario}>
                          {nombreCine(f.cine)} · {f.sala}
                        </span>
                      </span>
                      <span className={styles.ocupacionFuncion}>
                        <BarraOcupacion fraccion={fraccion} />
                        <span className={styles.numero}>
                          {miles(f.vendidas)}/{miles(f.capacidad)}
                          <span className="visually-hidden"> entradas vendidas</span>
                        </span>
                      </span>
                      {badge && (
                        <span className={`${styles.badge} ${fraccion >= 1 ? styles.badgeAgotada : ''}`}>{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <Link to="/admin/funciones" className={styles.verTodas}>
        Ver todas las funciones
      </Link>
    </>
  );
}

const PARTES_CONVERSION = [
  { clave: 'pagadas', texto: 'Pagadas', clase: 'pagadas' },
  { clave: 'vencidas', texto: 'Vencidas', clase: 'vencidas' },
  { clave: 'canceladas', texto: 'Canceladas', clase: 'canceladas' },
  { clave: 'pendientes', texto: 'Pendientes', clase: 'pendientes' },
];

function Conversion({ conversion }) {
  const tasa = conversion.creadas ? conversion.pagadas / conversion.creadas : 0;
  const resumen = PARTES_CONVERSION.map((p) => `${p.texto}: ${conversion[p.clave]}`).join(', ');
  return (
    <>
      <p className={styles.numeroGrande}>
        {porcentaje(tasa)}
        <span className={styles.numeroGrandeTexto}>
          de {miles(conversion.creadas)}{' '}
          {conversion.creadas === 1 ? 'reserva terminó pagada' : 'reservas terminaron pagadas'}
        </span>
      </p>
      <div className={styles.apilada} role="img" aria-label={`Reservas creadas: ${conversion.creadas}. ${resumen}.`}>
        {PARTES_CONVERSION.filter((p) => conversion[p.clave] > 0).map((p) => (
          <span key={p.clave} className={styles[p.clase]} style={{ flexGrow: conversion[p.clave] }} />
        ))}
      </div>
      <ul className={styles.leyenda}>
        {PARTES_CONVERSION.map((p) => (
          <li key={p.clave}>
            <span className={`${styles.muestra} ${styles[p.clase]}`} aria-hidden="true" />
            {p.texto} <strong>{miles(conversion[p.clave])}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}

// Mapa de calor con CSS grid: dias en las filas, horas de inicio en las columnas. La intensidad es
// proporcional a la celda con mas entradas; el valor exacto va en el tooltip (title) y en la tabla oculta.
function MapaDeCalor({ franjas }) {
  const horasConDatos = franjas.map((f) => f.hora);
  const desde = Math.min(12, ...horasConDatos);
  const hasta = Math.max(23, ...horasConDatos);
  const horas = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  const valor = new Map(franjas.map((f) => [`${f.dia}-${f.hora}`, f.entradas]));
  const maximo = Math.max(...franjas.map((f) => f.entradas));
  const masVendida = franjas.reduce((a, b) => (b.entradas > a.entradas ? b : a));

  return (
    <>
      <p className={styles.secundario}>
        La franja más fuerte es el {DIAS_SEMANA[masVendida.dia - 1].toLowerCase()} a las {masVendida.hora} h, con{' '}
        {miles(masVendida.entradas)} entradas.
      </p>
      <div className={styles.calorCaja} aria-hidden="true">
        <div className={styles.calor} style={{ '--horas': horas.length }}>
          <span />
          {horas.map((h) => (
            <span key={h} className={styles.calorHora}>
              {h}
            </span>
          ))}
          {DIAS_SEMANA.map((dia, i) => (
            <div key={dia} className={styles.calorFila}>
              <span className={styles.calorDia}>{dia.slice(0, 3)}</span>
              {horas.map((h) => {
                const cantidad = valor.get(`${i + 1}-${h}`) ?? 0;
                const intensidad = cantidad ? Math.round(15 + (cantidad / maximo) * 85) : 0;
                return (
                  <span
                    key={h}
                    className={styles.celda}
                    style={{ '--intensidad': `${intensidad}%` }}
                    title={`${dia} ${h} h: ${miles(cantidad)} ${cantidad === 1 ? 'entrada' : 'entradas'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <table className="visually-hidden">
        <caption>Entradas vendidas por día y hora de la función (solo las franjas con ventas)</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Hora</th>
            <th scope="col">Entradas</th>
          </tr>
        </thead>
        <tbody>
          {franjas.map((f) => (
            <tr key={`${f.dia}-${f.hora}`}>
              <td>{DIAS_SEMANA[f.dia - 1]}</td>
              <td>{f.hora} h</td>
              <td>{f.entradas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function PorCine({ cines }) {
  return (
    <div className={admin.tablaCaja}>
      <table className={admin.tabla}>
        <thead>
          <tr>
            <th scope="col">Cine</th>
            <th scope="col">Ingresos</th>
            <th scope="col">Entradas</th>
            <th scope="col">Ocupación</th>
          </tr>
        </thead>
        <tbody>
          {cines.map((c) => (
            <tr key={c.cineId}>
              <td className={admin.principal}>{nombreCine(c.nombre)}</td>
              <td className={admin.numero}>{pesos(c.ingresos)}</td>
              <td className={admin.numero}>{miles(c.entradas)}</td>
              <td>
                <span className={styles.ocupacionCelda}>
                  <BarraOcupacion fraccion={Number(c.ocupacion)} />
                  <span className={styles.numero}>{porcentaje(c.ocupacion)}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Promociones({ promociones }) {
  return (
    <div className={admin.tablaCaja}>
      <table className={admin.tabla}>
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Usos</th>
            <th scope="col">Descuento total</th>
          </tr>
        </thead>
        <tbody>
          {promociones.map((p) => (
            <tr key={p.codigo}>
              <td className={admin.codigo}>{p.codigo}</td>
              <td className={admin.numero}>{miles(p.usos)}</td>
              <td className={admin.numero}>{pesos(p.descuentoTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Asistencia({ asistencia }) {
  const tasa = asistencia.usadas / asistencia.emitidas;
  return (
    <>
      <p className={styles.numeroGrande}>
        {porcentaje(tasa)}
        <span className={styles.numeroGrandeTexto}>de las entradas se usaron para entrar a la sala</span>
      </p>
      <p className={styles.secundario}>
        {miles(asistencia.usadas)} de {miles(asistencia.emitidas)} entradas emitidas en funciones que ya pasaron.
      </p>
    </>
  );
}
