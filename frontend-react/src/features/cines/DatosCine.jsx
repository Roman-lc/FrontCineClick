import BadgeFormato from '../../components/ui/BadgeFormato';
import { formatearTelefono } from '../../lib/normalizar';
import { direccionCine, enlaceTelefono, ubicacionCine, urlComoLlegar } from './cines';
import styles from './cines.module.css';

const icono = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

// Contacto (direccion con "Cómo llegar", telefono y horario) y badges de formatos.
// La usan la tarjeta del listado y el encabezado de la pagina del cine.
export default function DatosCine({ cine, horario, formatos }) {
  return (
    <>
      <ul className={styles.contacto}>
        <li>
          <svg {...icono}>
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span>
            <span className="visually-hidden">Dirección: </span>
            {direccionCine(cine)}, {ubicacionCine(cine)}{' '}
            <a href={urlComoLlegar(cine)} target="_blank" rel="noopener noreferrer" className={styles.comoLlegar}>
              Cómo llegar ›<span className="visually-hidden"> (se abre en otra pestaña)</span>
            </a>
          </span>
        </li>
        {cine.telefono && (
          <li>
            <svg {...icono}>
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
            </svg>
            <a href={enlaceTelefono(cine.telefono)} className={styles.telefono}>
              <span className="visually-hidden">Teléfono: </span>
              {formatearTelefono(cine.telefono)}
            </a>
          </li>
        )}
        <li className={styles.horario}>
          <svg {...icono}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>{horario.texto}</span>
        </li>
      </ul>
      {formatos.length > 0 && (
        <p className={styles.formatos}>
          <span className="visually-hidden">Formatos: </span>
          {formatos.map((f) => (
            <BadgeFormato key={f} formato={f} />
          ))}
        </p>
      )}
    </>
  );
}
