import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoError from '../../components/ui/EstadoError';
import { EsqueletoTarjetas } from '../../components/ui/Esqueletos';
import { nombreCine } from '../../lib/formato';
import { rutaCine } from '../../lib/slug';
import { getCines } from '../../services/cines';
import FotoCine from '../cines/FotoCine';
import PaginaLectura from './PaginaLectura';
import styles from './nosotros.module.css';

const icono = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

const OFRECEMOS = [
  {
    titulo: 'Comprá online y elegí tu butaca',
    texto: 'Ves la sala tal como es, elegís dónde sentarte y pagás en tres pasos. Las butacas quedan reservadas mientras completás la compra.',
    svg: (
      <svg {...icono}>
        <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
        <path d="M3 11h18v5H3zM6 16v3M18 16v3" />
      </svg>
    ),
  },
  {
    titulo: 'Formatos especiales',
    texto: 'Además de 2D y 3D, salas IMAX, 4D y Premium para las películas que lo merecen.',
    svg: (
      <svg {...icono}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    titulo: 'Promociones',
    texto: 'Códigos de descuento con sus condiciones a la vista, y precios especiales para menores y jubilados.',
    svg: (
      <svg {...icono}>
        <path d="M20 12l-8 8-9-9V4h7z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    titulo: 'Entrada con código',
    texto: 'Cada entrada tiene su QR y un código de 8 caracteres. Lo mostrás en el celular o impreso y pasás directo a la sala.',
    svg: (
      <svg {...icono}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
      </svg>
    ),
  },
];

function NuestrosCines() {
  const [estado, setEstado] = useState({ cargando: true, error: false, cines: [] });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let ignorar = false;
    getCines()
      .then((cines) => !ignorar && setEstado({ cargando: false, error: false, cines }))
      .catch(() => !ignorar && setEstado({ cargando: false, error: true, cines: [] }));
    return () => {
      ignorar = true;
    };
  }, [intento]);

  if (estado.cargando) return <EsqueletoTarjetas cantidad={3} alto={170} className={styles.cines} etiqueta="Cargando cines" />;
  if (estado.error) {
    return (
      <EstadoError
        titulo="No pudimos cargar los cines"
        onReintentar={() => {
          setEstado({ cargando: true, error: false, cines: [] });
          setIntento((n) => n + 1);
        }}
      />
    );
  }
  return (
    <ul className={styles.cines}>
      {estado.cines.map((cine) => (
        <li key={cine.id}>
          <Link to={rutaCine(cine.nombre)} className={styles.cine}>
            <FotoCine cine={cine} className={styles.foto} />
            <span className={styles.cineNombre}>{nombreCine(cine.nombre)}</span>
            {cine.localidad && <span className={styles.cineBarrio}>{cine.localidad}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const SECCIONES = [
  {
    id: 'historia',
    titulo: 'Nuestra historia',
    contenido: (
      <>
        <p>
          CineClick nació en Buenos Aires con una idea simple: que ir al cine empiece bien desde la primera pantalla. Abrimos nuestra
          primera sala en el Abasto y hoy estamos también en Recoleta y Palermo.
        </p>
        <p>
          Nuestra misión es que elegir una película, un horario y una butaca lleve un par de minutos, con precios claros y sin
          sorpresas, para que lo único importante sea lo que pasa en la pantalla.
        </p>
      </>
    ),
  },
  { id: 'cines', titulo: 'Nuestros cines', contenido: <NuestrosCines /> },
  {
    id: 'ofrecemos',
    titulo: 'Qué ofrecemos',
    contenido: (
      <ul className={styles.ofrecemos}>
        {OFRECEMOS.map((o) => (
          <li key={o.titulo} className={styles.bloque}>
            <span className={styles.icono}>{o.svg}</span>
            <strong className={styles.bloqueTitulo}>{o.titulo}</strong>
            <span>{o.texto}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

export default function NosotrosPage() {
  return (
    <PaginaLectura titulo="Nosotros" bajada="Queremos que ir al cine sea fácil desde el primer clic." secciones={SECCIONES} />
  );
}
