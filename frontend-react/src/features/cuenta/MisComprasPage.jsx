import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../../components/ui/Esqueletos';
import Poster from '../../components/ui/Poster';
import { getComprasDelCliente } from '../../services/compras';
import { getFuncion } from '../../services/funciones';
import { getListaEspera } from '../../services/listaEspera';
import { cuandoFalta, fechaDiaMes, fechaFuncionCorta, fechaHoraBreve } from '../../lib/fechas';
import { etiquetaFormato, etiquetaIdioma, formatearPrecio, nombreCine } from '../../lib/formato';
import { rutaPelicula } from '../../lib/slug';
import { estadoDeCompra, textoEntradas } from './compras';
import styles from './cuenta.module.css';

export default function MisComprasPage() {
  const { user } = useAuth();
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: false, compras: [], avisos: [] });
  const [verCanceladas, setVerCanceladas] = useState(false);

  useEffect(() => {
    let ignorar = false;
    Promise.all([getComprasDelCliente(user.clienteId), getListaEspera(user.clienteId).catch(() => [])])
      .then(async ([compras, avisos]) => {
        // Un backend sin el resumen de la funcion en la compra: se piden las funciones (sin repetir)
        const faltantes = [...new Set(compras.filter((c) => !c.funcion).map((c) => c.funcionId))];
        const funciones = await Promise.all(faltantes.map((id) => getFuncion(id).catch(() => null)));
        const porId = new Map(funciones.filter(Boolean).map((f) => [f.id, f]));
        const completas = compras.map((c) => (c.funcion ? c : { ...c, funcion: porId.get(c.funcionId) }));
        if (!ignorar) setEstado({ cargando: false, error: false, compras: completas, avisos });
      })
      .catch(() => {
        if (!ignorar) setEstado({ cargando: false, error: true, compras: [], avisos: [] });
      });
    return () => {
      ignorar = true;
    };
  }, [user.clienteId, intento]);

  // Cada compra con su estado (las reservas en curso no se listan)
  const conEstado = estado.compras
    .filter((c) => c.funcion)
    .map((compra) => ({ compra, estado: estadoDeCompra(compra) }))
    .filter((c) => c.estado);
  const inicio = (c) => c.compra.funcion.fechaHoraInicio;
  const proximas = conEstado.filter((c) => c.estado.clave === 'proxima').sort((a, b) => inicio(a).localeCompare(inicio(b)));
  const anteriores = conEstado
    .filter((c) => c.estado.clave !== 'proxima' && (verCanceladas || c.estado.clave !== 'cancelada'))
    .sort((a, b) => inicio(b).localeCompare(inicio(a)));
  const cantidadCanceladas = conEstado.filter((c) => c.estado.clave === 'cancelada').length;

  return (
    <section className="section">
      <title>Mis compras | CineClick</title>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Mis compras</h1>
        {cantidadCanceladas > 0 && (
          <button type="button" role="switch" aria-checked={verCanceladas} className={styles.interruptor} onClick={() => setVerCanceladas((v) => !v)}>
            <span className={styles.interruptorPista} aria-hidden="true">
              <span className={styles.interruptorBoton} />
            </span>
            Mostrar canceladas ({cantidadCanceladas})
          </button>
        )}
      </div>

      {estado.cargando && <EsqueletoFilas cantidad={3} alto={88} etiqueta="Cargando tus compras" />}
      {estado.error && (
        <EstadoError
          titulo="No pudimos cargar tus compras"
          onReintentar={() => {
            setEstado({ cargando: true, error: false, compras: [], avisos: [] });
            setIntento((n) => n + 1);
          }}
        />
      )}
      {!estado.cargando && !estado.error && conEstado.length === 0 && (
        <EstadoVacio titulo="Todavía no tenés compras" mensaje="Cuando compres entradas, las vas a ver acá con sus códigos.">
          <Link to="/" className="btn btn-primary">
            Ver la cartelera
          </Link>
        </EstadoVacio>
      )}

      {!estado.cargando && !estado.error && conEstado.length > 0 && (
        <>
          <section className={styles.grupo} aria-labelledby="titulo-proximas">
            <h2 id="titulo-proximas" className={styles.subtitulo}>
              Próximas funciones
            </h2>
            {proximas.length ? (
              <ListaCompras items={proximas} />
            ) : (
              <p className={styles.sinItems}>
                No tenés funciones por delante. <Link to="/">Ver la cartelera</Link>
              </p>
            )}
          </section>

          {anteriores.length > 0 && (
            <section className={styles.grupo} aria-labelledby="titulo-anteriores">
              <h2 id="titulo-anteriores" className={styles.subtitulo}>
                Anteriores
              </h2>
              <ListaCompras items={anteriores} />
            </section>
          )}
        </>
      )}

      {estado.avisos.length > 0 && (
        <section className={styles.avisos} aria-labelledby="titulo-avisos">
          <h2 id="titulo-avisos" className={styles.subtitulo}>
            Te avisamos cuando salgan
          </h2>
          <ul className={styles.listaAvisos}>
            {estado.avisos.map((aviso) => (
              <li key={aviso.peliculaId}>
                <Link to={rutaPelicula(aviso.peliculaTitulo)}>{aviso.peliculaTitulo}</Link>
                {aviso.fechaEstreno && <span> · Estreno {fechaDiaMes(aviso.fechaEstreno)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

function ListaCompras({ items }) {
  return (
    <ul className={styles.filas}>
      {items.map(({ compra, estado }) => (
        <li key={compra.id}>
          <FilaCompra compra={compra} estado={estado} />
        </li>
      ))}
    </ul>
  );
}

// Fila compacta. Toda la fila lleva al detalle: el enlace es el titulo y su area se estira a la fila
// (asi el lector de pantalla anuncia un solo enlace con un nombre corto).
function FilaCompra({ compra, estado }) {
  const { funcion } = compra;
  const cancelada = estado.clave === 'cancelada';
  return (
    <article className={`${styles.fila} ${cancelada ? styles.filaApagada : ''}`}>
      <Poster pelicula={{ titulo: funcion.peliculaTitulo, urlPoster: funcion.urlPoster }} className={styles.poster} />

      <div className={styles.pelicula}>
        <h3 className={styles.peliculaTitulo}>
          <Link to={`/compra/confirmacion/${compra.id}`} className={styles.enlaceFila}>
            {funcion.peliculaTitulo}
          </Link>
        </h3>
        <p className={styles.dato}>
          {etiquetaFormato(funcion.formato)} · {etiquetaIdioma(funcion.idioma)}
        </p>
        <p className={styles.compraNumero}>
          Compra N° {compra.id} · {fechaHoraBreve(compra.fechaCompra)}
        </p>
      </div>

      <div className={styles.cuando}>
        <p className={styles.fecha}>{fechaFuncionCorta(funcion.fechaHoraInicio)}</p>
        {estado.clave === 'proxima' && <span className={styles.relativo}>{cuandoFalta(funcion.fechaHoraInicio)}</span>}
      </div>

      <p className={`${styles.dato} ${styles.lugar}`}>
        {nombreCine(funcion.cineNombre)} · {funcion.salaNombre}
      </p>

      <p className={`${styles.dato} ${styles.entradas}`}>{textoEntradas(compra.entradas)}</p>

      <p className={styles.total}>{cancelada ? 'Sin cargo' : formatearPrecio(compra.total)}</p>

      <p className={`${styles.estado} ${styles[estado.clave]}`}>{estado.texto}</p>
    </article>
  );
}
