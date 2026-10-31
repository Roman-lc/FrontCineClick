import { useState } from 'react';
import styles from './Poster.module.css';

// Poster 2:3. Si la pelicula no tiene imagen (o no carga) muestra un recuadro con el titulo.
// alt vacio: en las pantallas donde se usa, el titulo ya esta escrito al lado.
export default function Poster({ pelicula, className = '', cargaDiferida = true }) {
  const [sinPoster, setSinPoster] = useState(!pelicula.urlPoster);

  if (sinPoster) {
    return (
      <div className={`${styles.poster} ${styles.vacio} ${className}`}>
        <span>{pelicula.titulo}</span>
      </div>
    );
  }
  return (
    <img
      className={`${styles.poster} ${className}`}
      src={pelicula.urlPoster}
      alt=""
      loading={cargaDiferida ? 'lazy' : 'eager'}
      onError={() => setSinPoster(true)}
    />
  );
}
