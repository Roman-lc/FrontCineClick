import { useState } from 'react';
import styles from './Poster.module.css';

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
