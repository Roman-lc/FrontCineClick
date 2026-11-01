import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoGrillaCines } from '../../components/ui/Esqueletos';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { ORDEN_FORMATOS, etiquetaFormato, nombreCine } from '../../lib/formato';
import { rutaCine } from '../../lib/slug';
import DatosCine from './DatosCine';
import FotoCine from './FotoCine';
import { formatosDelCine, horarioDelCine } from './cines';
import styles from './cines.module.css';

export default function CinesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: false, datos: null });

  useEffect(() => {
    let ignorar = false;
    Promise.all([getCines(), getFunciones()])
      .then(([cines, funciones]) => {
        if (!ignorar) setEstado({ cargando: false, error: false, datos: { cines, funciones } });
      })
      .catch(() => {
        if (!ignorar) setEstado({ cargando: false, error: true, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  const cines = (estado.datos?.cines ?? [])
    .filter((c) => c.activo !== false)
    .map((cine) => {
      const funciones = estado.datos.funciones.filter((f) => f.cineId === cine.id);
      return { cine, formatos: formatosDelCine(cine, funciones), horario: horarioDelCine(funciones) };
    });
  // Chips de filtro: solo los formatos que tiene algun cine. El elegido va en la URL (?formato=IMAX)
  const formatosExistentes = [...new Set(cines.flatMap((c) => c.formatos))].sort(
    (a, b) => ORDEN_FORMATOS.indexOf(a) - ORDEN_FORMATOS.indexOf(b)
  );
  const formato = formatosExistentes.includes(searchParams.get('formato')) ? searchParams.get('formato') : '';
  const visibles = formato ? cines.filter((c) => c.formatos.includes(formato)) : cines;
  const elegirFormato = (valor) =>
    setSearchParams((actuales) => {
      const nuevos = new URLSearchParams(actuales);
      if (valor) nuevos.set('formato', valor);
      else nuevos.delete('formato');
      return nuevos;
    }, { replace: true });

  return (
    <section className="section">
      <title>Cines | CineClick</title>
      <h1 className={styles.titulo}>Cines</h1>
      <p className={styles.bajada}>Elegí un cine para ver su cartelera día por día.</p>

      {formatosExistentes.length > 1 && (
        <div className={styles.filtro} role="group" aria-label="Filtrar por formato">
          {['', ...formatosExistentes].map((f) => (
            <button
              key={f || 'todos'}
              type="button"
              className={styles.chipFiltro}
              aria-pressed={formato === f}
              onClick={() => elegirFormato(f)}
            >
              {f ? etiquetaFormato(f) : 'Todos'}
            </button>
          ))}
        </div>
      )}

      {estado.cargando && <EsqueletoGrillaCines className={styles.grillaCines} />}
      {estado.error && (
        <EstadoError
          titulo="No pudimos cargar los cines"
          onReintentar={() => {
            setEstado({ cargando: true, error: false, datos: null });
            setIntento((n) => n + 1);
          }}
        />
      )}
      {estado.datos && visibles.length === 0 && (
        <EstadoVacio
          titulo={formato ? `Ningún cine tiene ${etiquetaFormato(formato)}` : 'Todavía no hay cines cargados'}
          mensaje={formato ? 'Probá con otro formato.' : 'Mientras tanto podés ver la cartelera.'}
        >
          {formato ? (
            <button type="button" className="btn btn-primary" onClick={() => elegirFormato('')}>
              Ver todos los cines
            </button>
          ) : (
            <Link to="/" className="btn btn-primary">
              Ver la cartelera
            </Link>
          )}
        </EstadoVacio>
      )}

      {visibles.length > 0 && (
        <ul className={styles.grillaCines}>
          {visibles.map(({ cine, formatos, horario }) => (
            <li key={cine.id} className={styles.tarjetaCine}>
              <div className={styles.fotoCaja}>
                <FotoCine cine={cine} className={styles.fotoTarjeta} />
                {horario.abierto && <span className={styles.abierto}>Abierto ahora</span>}
              </div>
              <div className={styles.cuerpoCine}>
                <h2 className={styles.nombreCine}>
                  <Link to={rutaCine(cine.nombre)}>{nombreCine(cine.nombre)}</Link>
                </h2>
                <DatosCine cine={cine} horario={horario} formatos={formatos} />
                <Link to={rutaCine(cine.nombre)} className={`btn btn-primary ${styles.verCartelera}`}>
                  Ver cartelera
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
