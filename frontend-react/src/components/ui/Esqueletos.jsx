import tarjeta from './PeliculaCard.module.css';
import styles from './Esqueletos.module.css';

/**
 * Esqueletos de carga: bloques con la misma forma y tamaño que el contenido final, para que la
 * pagina no salte al llegar los datos. El pulso se apaga con prefers-reduced-motion.
 *
 * Todos aceptan:
 * - etiqueta: lo que se esta cargando, para lectores de pantalla ("Cargando cartelera")
 * Los de listas aceptan ademas:
 * - cantidad: cuantos elementos dibujar
 * - className: la clase de la grilla o lista real, para que ocupen el mismo lugar
 */

function Contenedor({ etiqueta, className = '', children, como: Etiqueta = 'div' }) {
  return (
    <Etiqueta className={className} role="status" aria-busy="true" aria-label={etiqueta}>
      {children}
    </Etiqueta>
  );
}

const Bloque = ({ className = '', style }) => <span className={`${styles.bloque} ${className}`} style={style} aria-hidden="true" />;

// Igual que PeliculaCard con la zona de horarios de la cartelera
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

// Igual que la tarjeta de /cines: foto 16:9, nombre, contacto, formatos y boton
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

// Filas genericas (compras, peliculas de un cine): alto en px
export function EsqueletoFilas({ cantidad = 3, alto = 120, className, etiqueta = 'Cargando' }) {
  return (
    <Contenedor etiqueta={etiqueta} className={`${styles.filas} ${className ?? ''}`}>
      {Array.from({ length: cantidad }, (_, i) => (
        <Bloque key={i} className={styles.fila} style={{ height: alto }} />
      ))}
    </Contenedor>
  );
}

// Detalle de pelicula: ficha (titulo, poster, datos) y la columna de horarios
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

// Slider de destacados (mismo alto que el real)
export function EsqueletoSlider({ etiqueta = 'Cargando destacados' }) {
  return (
    <Contenedor etiqueta={etiqueta}>
      <Bloque className={styles.slider} />
    </Contenedor>
  );
}

// Pasos de la compra: cabecera, contenido y resumen
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

// Tarjetas genericas en grilla (promociones): alto en px
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
