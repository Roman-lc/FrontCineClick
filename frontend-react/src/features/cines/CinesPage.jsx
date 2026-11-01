import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import { getCines } from '../../services/cines';
import { getFunciones } from '../../services/funciones';
import { fechaDeFuncion, funcionVigente, hoyISO } from '../../lib/fechas';
import { rutaCine } from '../../lib/slug';
import { etiquetaSala } from './salas';
import styles from './cines.module.css';

export default function CinesPage() {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: '', datos: null });

  useEffect(() => {
    let ignorar = false;
    Promise.all([getCines(), getFunciones({ fecha: hoyISO() })])
      .then(([cines, funciones]) => {
        if (!ignorar) setEstado({ cargando: false, error: '', datos: { cines, funciones } });
      })
      .catch((err) => {
        if (!ignorar) setEstado({ cargando: false, error: err.message, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  const cines = (estado.datos?.cines ?? []).filter((c) => c.activo !== false);
  // Peliculas distintas con funciones que todavia no empezaron hoy, por cine
  const peliculasHoy = (cineId) =>
    new Set(
      (estado.datos?.funciones ?? [])
        .filter((f) => f.cineId === cineId && funcionVigente(f) && fechaDeFuncion(f) === hoyISO())
        .map((f) => f.peliculaId)
    ).size;

  return (
    <section className="section">
      <title>Cines | CineClick</title>
      <h1 className={styles.titulo}>Cines</h1>
      <p className={styles.bajada}>Elegí un cine para ver su cartelera día por día.</p>

      {estado.cargando && <Cargando texto="Cargando cines..." />}
      {estado.error && (
        <MensajeError
          mensaje={estado.error}
          onReintentar={() => {
            setEstado({ cargando: true, error: '', datos: null });
            setIntento((n) => n + 1);
          }}
        />
      )}
      {estado.datos && cines.length === 0 && <EstadoVacio mensaje="Todavía no hay cines cargados." />}

      <ul className={styles.grillaCines}>
        {cines.map((cine) => {
          const cantidad = peliculasHoy(cine.id);
          return (
            <li key={cine.id} className={styles.tarjetaCine}>
              <h2 className={styles.nombreCine}>
                <Link to={rutaCine(cine.nombre)}>{cine.nombre}</Link>
              </h2>
              <p className={styles.direccion}>
                {cine.direccion}
                {cine.ciudad && `, ${cine.ciudad}`}
              </p>
              {cine.telefono && <p className={styles.telefono}>Tel. {cine.telefono}</p>}
              <ul className={styles.salas} aria-label="Salas">
                {cine.salas
                  .filter((s) => s.activa !== false)
                  .map((sala) => (
                    <li key={sala.id}>{etiquetaSala(sala)}</li>
                  ))}
              </ul>
              <p className={styles.hoy}>
                {cantidad === 0 ? 'Sin más funciones hoy' : `${cantidad} ${cantidad === 1 ? 'película' : 'películas'} hoy`}
              </p>
              <Link to={rutaCine(cine.nombre)} className={`btn btn-primary ${styles.verCartelera}`}>
                Ver cartelera
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
