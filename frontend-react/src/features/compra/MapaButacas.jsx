import { IconoOcupada, IconoSillaDeRuedas } from './iconos';
import styles from './mapa.module.css';

// Dibuja la sala con la grilla del plano: "columna" es la posicion de cada butaca, asi que los
// numeros de columna que no aparecen quedan como pasillos o huecos.
export default function MapaButacas({ butacas, elegidas, onAlternar }) {
  const columnas = Math.max(...butacas.map((b) => b.columna ?? b.numero));
  const idsElegidos = new Set(elegidas.map((b) => b.id));

  return (
    <div className={styles.mapa}>
      <div className={styles.desplazable}>
        <div className={styles.sala} style={{ '--columnas': columnas }}>
          <div className={styles.pantalla} aria-hidden="true">
            <svg viewBox="0 0 300 24" preserveAspectRatio="none">
              <path d="M4 22 Q150 -6 296 22" />
            </svg>
            <span>Pantalla</span>
          </div>

          {agruparPorFila(butacas).map(([fila, lista]) => (
            <div key={fila} className={styles.fila} role="group" aria-label={`Fila ${fila}`}>
              <span className={styles.letra} aria-hidden="true">
                {fila}
              </span>
              {lista.map((butaca) => (
                <Butaca
                  key={butaca.id}
                  butaca={butaca}
                  elegida={idsElegidos.has(butaca.id)}
                  onClick={() => onAlternar(butaca)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <ul className={styles.leyenda} aria-label="Referencias">
        <li>
          <span className={styles.muestra} />
          Disponible
        </li>
        <li>
          <span className={`${styles.muestra} ${styles.muestraElegida}`} />
          Seleccionada
        </li>
        <li>
          <span className={`${styles.muestra} ${styles.muestraOcupada}`}>
            <IconoOcupada tamano={10} />
          </span>
          No disponible
        </li>
        <li>
          <span className={styles.muestra}>
            <IconoSillaDeRuedas tamano={12} />
          </span>
          Silla de ruedas
        </li>
      </ul>
    </div>
  );
}

function Butaca({ butaca, elegida, onClick }) {
  const silla = butaca.tipo === 'DISCAPACIDAD';
  const estado = !butaca.disponible ? 'no disponible' : elegida ? 'seleccionada' : 'disponible';
  const clases = [styles.butaca, elegida && styles.elegida, !butaca.disponible && styles.ocupada, silla && styles.silla]
    .filter(Boolean)
    .join(' ');

  let contenido = butaca.codigo;
  if (!butaca.disponible) contenido = <IconoOcupada />;
  else if (silla) contenido = <IconoSillaDeRuedas />;

  return (
    <button
      type="button"
      className={clases}
      style={{ gridColumn: (butaca.columna ?? butaca.numero) + 1 }}
      onClick={onClick}
      disabled={!butaca.disponible}
      aria-pressed={butaca.disponible ? elegida : undefined}
      aria-label={`Butaca ${butaca.codigo}${silla ? ', lugar para silla de ruedas' : ''}, ${estado}`}
      title={silla ? `${butaca.codigo} · lugar para silla de ruedas` : butaca.codigo}
    >
      {contenido}
    </button>
  );
}

function agruparPorFila(butacas) {
  const filas = new Map();
  for (const butaca of butacas) {
    if (!filas.has(butaca.fila)) filas.set(butaca.fila, []);
    filas.get(butaca.fila).push(butaca);
  }
  return [...filas.entries()]
    .sort(([a], [b]) => a.length - b.length || a.localeCompare(b))
    .map(([fila, lista]) => [fila, lista.sort((a, b) => (a.columna ?? a.numero) - (b.columna ?? b.numero))]);
}
