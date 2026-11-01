import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import Poster from '../../components/ui/Poster';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { getPeliculas } from '../../services/peliculas';
import { ApiError } from '../../services/http';
import { fechaDeFuncion, funcionVigente, hoyISO, sumarDiasISO } from '../../lib/fechas';
import { etiquetaFormato, etiquetaGenero, formatearDuracion } from '../../lib/formato';
import { aSlug, rutaPelicula } from '../../lib/slug';
import BarraFuncionElegida from '../compra/BarraFuncionElegida';
import ChipHorario from '../pelicula/ChipHorario';
import SelectorDias from '../pelicula/SelectorDias';
import { agruparPorFormatoEIdioma } from '../pelicula/horarios';
import { etiquetaSala } from './salas';
import styles from './cines.module.css';

const DIAS = 7;

// /cines/<slug del nombre>: datos del cine y su cartelera dia por dia. La key reinicia al cambiar de cine.
export default function CinePage() {
  const { slug } = useParams();
  return <CarteleraDelCine key={slug} slug={slug} />;
}

function CarteleraDelCine({ slug }) {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });
  const [diaElegido, setDiaElegido] = useState(null);
  const [elegida, setElegida] = useState(null);

  useEffect(() => {
    let ignorar = false;
    Promise.all([getCines(), getPeliculas()])
      .then(async ([cines, peliculas]) => {
        const cine = cines.find((c) => c.activo !== false && aSlug(c.nombre) === slug);
        if (!cine) throw new ApiError(404, 'Cine no encontrado');
        const funciones = await getFunciones({ cineId: cine.id });
        if (!ignorar) setEstado({ cargando: false, error: null, datos: { cine, peliculas, funciones } });
      })
      .catch((error) => {
        if (!ignorar) setEstado({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [slug, intento]);

  if (estado.cargando) {
    return (
      <section className="section">
        <Cargando texto="Cargando cartelera..." />
      </section>
    );
  }

  if (estado.error) {
    return (
      <section className="section">
        {estado.error.status === 404 ? (
          <EstadoVacio mensaje="El cine que buscás no existe.">
            <Link to="/cines" className="btn btn-primary">
              Ver todos los cines
            </Link>
          </EstadoVacio>
        ) : (
          <MensajeError
            mensaje={estado.error.message}
            onReintentar={() => {
              setEstado({ cargando: true, error: null, datos: null });
              setIntento((n) => n + 1);
            }}
          />
        )}
      </section>
    );
  }

  const { cine, peliculas, funciones } = estado.datos;
  const vigentes = funciones.filter(funcionVigente);
  const dias = Array.from({ length: DIAS }, (_, i) => sumarDiasISO(hoyISO(), i));
  const conFunciones = new Set(vigentes.map(fechaDeFuncion));
  const dia = diaElegido ?? dias.find((d) => conFunciones.has(d)) ?? dias[0];
  const cartelera = carteleraDelDia(vigentes, peliculas, dia);

  return (
    <section className="section">
      <title>{`${cine.nombre} | CineClick`}</title>
      <Link to="/cines" className={styles.volver}>
        ‹ Todos los cines
      </Link>

      <header className={styles.cabeceraCine}>
        <h1 className={styles.titulo}>{cine.nombre}</h1>
        <p className={styles.direccion}>
          {cine.direccion}
          {cine.ciudad && `, ${cine.ciudad}`}
          {cine.telefono && ` · Tel. ${cine.telefono}`}
        </p>
        <ul className={styles.salas} aria-label="Salas">
          {cine.salas
            .filter((s) => s.activa !== false)
            .map((sala) => (
              <li key={sala.id}>{etiquetaSala(sala)}</li>
            ))}
        </ul>
      </header>

      <h2 className={styles.subtitulo}>Cartelera</h2>
      <SelectorDias dias={dias} valor={dia} onCambiar={setDiaElegido} />

      {cartelera.length === 0 ? (
        <EstadoVacio mensaje={`No hay funciones para este día en ${cine.nombre}.`} />
      ) : (
        <ul className={styles.peliculas}>
          {cartelera.map(({ pelicula, funciones: delDia }) => {
            const enlace = { to: rutaPelicula(pelicula.titulo), state: { cineId: String(cine.id), dia } };
            const datos = [pelicula.clasificacion, formatearDuracion(pelicula.duracionMinutos), etiquetaGenero(pelicula.genero)];
            return (
              <li key={pelicula.id} className={styles.pelicula}>
                <Link to={enlace.to} state={enlace.state} className={styles.posterEnlace} tabIndex={-1} aria-hidden="true">
                  <Poster pelicula={pelicula} className={styles.poster} />
                </Link>
                <div className={styles.peliculaInfo}>
                  <h3 className={styles.peliculaTitulo}>
                    <Link to={enlace.to} state={enlace.state}>
                      {pelicula.titulo}
                    </Link>
                  </h3>
                  <p className={styles.peliculaDatos}>{datos.filter(Boolean).join(' · ')}</p>
                  {agruparPorFormatoEIdioma(delDia).map((grupo) => (
                    <div key={`${grupo.formato}|${grupo.idioma}`} className={styles.grupo}>
                      <p className={styles.grupoTitulo}>
                        <strong>{etiquetaFormato(grupo.formato)}</strong> · {grupo.idioma.toUpperCase()}
                      </p>
                      <ul className={styles.chips}>
                        {grupo.funciones.map((funcion) => (
                          <li key={funcion.id}>
                            <ChipHorario funcion={funcion} elegida={funcion.id === elegida?.id} onElegir={setElegida} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {elegida && <BarraFuncionElegida funcion={elegida} onQuitar={() => setElegida(null)} />}
    </section>
  );
}

// Peliculas con funciones ese dia (destacadas primero, despues por titulo), cada una con sus funciones
function carteleraDelDia(funciones, peliculas, dia) {
  const porPelicula = new Map();
  for (const f of funciones) {
    if (fechaDeFuncion(f) !== dia) continue;
    if (!porPelicula.has(f.peliculaId)) porPelicula.set(f.peliculaId, []);
    porPelicula.get(f.peliculaId).push(f);
  }
  return peliculas
    .filter((p) => porPelicula.has(p.id))
    .sort((a, b) => Number(b.destacada) - Number(a.destacada) || a.titulo.localeCompare(b.titulo))
    .map((pelicula) => ({ pelicula, funciones: porPelicula.get(pelicula.id) }));
}
