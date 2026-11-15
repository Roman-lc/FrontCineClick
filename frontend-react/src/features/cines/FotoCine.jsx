import { useState } from 'react';
import { nombreCine } from '../../lib/formato';
import styles from './cines.module.css';

export default function FotoCine({ cine, className = '', cargaDiferida = true }) {
  const [fallo, setFallo] = useState(false);
  if (!cine.urlImagen || fallo) {
    return (
      <div className={`${styles.foto} ${styles.fotoVacia} ${className}`} aria-hidden="true">
        <span>{nombreCine(cine.nombre)}</span>
      </div>
    );
  }
  return (
    <img
      className={`${styles.foto} ${className}`}
      src={cine.urlImagen}
      alt=""
      loading={cargaDiferida ? 'lazy' : 'eager'}
      onError={() => setFallo(true)}
    />
  );
}
