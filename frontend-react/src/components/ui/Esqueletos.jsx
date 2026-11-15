import tarjeta from './PeliculaCard.module.css';
import styles from './Esqueletos.module.css';

function Contenedor({ etiqueta, className = '', children, como: Etiqueta = 'div' }) {
  return (
    <Etiqueta className={className} role="status" aria-busy="true" aria-label={etiqueta}>
      {children}
    </Etiqueta>
  );
}

const Bloque = ({ className = '', style }) => <span className={`${styles.bloque} ${className}`} style={style} aria-hidden="true" />;

export function EsqueletoGrillaPeliculas({ cantidad = 8, className, etiqueta = 'Cargando películas' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={className} como="ul">
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} aria-hidden="true">
          <div className={tarjeta.card}>
            <div className={tarjeta.posterCaja}>
              <Bloque className={styles.poster} />
            </div>
            <div className={tarjeta.info}>
              <Bloque className={styles.tituloPelicula} />
              <Bloque className={styles.lineaFormatos} />
              <Bloque className={styles.horarios} />
            </div>
          </div>
        </li>
      ))}
    </Contenedor>
  );
}

export function EsqueletoGrillaCines({ cantidad = 3, className, etiqueta = 'Cargando cines' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={className} como="ul">
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} className={styles.tarjetaCine} aria-hidden="true">
          <Bloque className={styles.foto} />
          <div className={styles.cuerpoCine}>
            <Bloque className={styles.nombreCine} />
            <Bloque className={styles.linea} />
            <Bloque className={styles.linea} />
            <Bloque className={styles.lineaCorta} />
            <Bloque className={styles.badges} />
            <Bloque className={styles.boton} />
          </div>
        </li>
      ))}
    </Contenedor>
  );
}

export function EsqueletoFilas({ cantidad = 3, alto = 120, className, etiqueta = 'Cargando' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={`${styles.filas} ${className ?? ''}`}>
      {Array.from({ length: cantidad }, (_, i) => (
        <Bloque key={i} className={styles.fila} style={{ height: alto }} />
      ))}
    </Contenedor>
  );
}

export function EsqueletoDetallePelicula({ className, etiqueta = 'Cargando película' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={className}>
      <div aria-hidden="true" className={styles.columnaFicha}>
        <Bloque className={styles.tituloGrande} />
        <Bloque className={styles.posterDetalle} />
        <Bloque className={styles.linea} />
        <Bloque className={styles.linea} />
        <Bloque className={styles.lineaCorta} />
      </div>
      <div aria-hidden="true" className={styles.columnaHorarios}>
        <Bloque className={styles.tituloGrande} />
        <Bloque className={styles.dias} />
        <Bloque className={styles.lineaCorta} />
        <Bloque className={styles.fila} style={{ height: 140 }} />
      </div>
    </Contenedor>
  );
}

export function EsqueletoSlider({ etiqueta = 'Cargando destacados' }) {
  return (
    <Contenedor etiqueta={etiqueta}>
      <Bloque className={styles.slider} />
    </Contenedor>
  );
}

export function EsqueletoCompra({ etiqueta = 'Cargando la compra' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={styles.compra}>
      <Bloque className={styles.cabeceraCompra} />
      <div className={styles.columnasCompra} aria-hidden="true">
        <div className={styles.filas}>
          <Bloque className={styles.lineaCorta} />
          <Bloque className={styles.fila} style={{ height: 92 }} />
          <Bloque className={styles.fila} style={{ height: 92 }} />
          <Bloque className={styles.fila} style={{ height: 92 }} />
        </div>
        <Bloque className={styles.resumen} />
      </div>
    </Contenedor>
  );
}

export function EsqueletoTarjetas({ cantidad = 3, alto = 220, className, etiqueta = 'Cargando' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={className} como="ul">
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} aria-hidden="true">
          <Bloque className={styles.fila} style={{ height: alto }} />
        </li>
      ))}
    </Contenedor>
  );
}
