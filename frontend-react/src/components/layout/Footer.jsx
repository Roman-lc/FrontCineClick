import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const DEFENSA_CONSUMIDOR = 'https://www.argentina.gob.ar/economia/industria-y-comercio/defensadelconsumidor';

export default function Footer() {
  return (
    <footer>
      <div className={styles.footer}>
        <div className={styles.marca}>
          <p className={styles.logo}>CineClick</p>
          <p>Comprá tus entradas online, elegí tu butaca y entrá con el código.</p>
        </div>

        <nav className={styles.columna} aria-label="Cartelera">
          <p className={styles.tituloColumna}>Cartelera</p>
          <ul>
            <li><Link to="/">Películas en cartelera</Link></li>
            <li><Link to="/cines">Cines</Link></li>
            <li><Link to="/promociones">Promociones</Link></li>
          </ul>
        </nav>

        <nav className={styles.columna} aria-label="Legales">
          <p className={styles.tituloColumna}>Legales</p>
          <ul>
            <li><Link to="/terminos">Términos y condiciones</Link></li>
            <li><Link to="/privacidad">Política de privacidad</Link></li>
            <li><Link to="/arrepentimiento">Botón de arrepentimiento</Link></li>
            <li>
              <a href={DEFENSA_CONSUMIDOR} target="_blank" rel="noopener noreferrer">
                Defensa de las y los consumidores<span className="visually-hidden"> (se abre en otra pestaña)</span>
              </a>
            </li>
          </ul>
        </nav>

        <nav className={styles.columna} aria-label="CineClick">
          <p className={styles.tituloColumna}>CineClick</p>
          <ul>
            <li><Link to="/grupo">Quiénes somos</Link></li>
          </ul>
        </nav>
      </div>

      <div className={styles.legal}>
        <p>Los precios están expresados en pesos argentinos e incluyen IVA. Las entradas son personales y válidas solo para la función indicada.</p>
        <p>&copy; 2026 CineClick · TPO Aplicaciones Interactivas. Proyecto académico: los pagos son simulados.</p>
      </div>
    </footer>
  );
}
