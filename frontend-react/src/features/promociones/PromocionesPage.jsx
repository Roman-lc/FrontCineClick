import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoError from '../../components/ui/EstadoError';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { EsqueletoTarjetas } from '../../components/ui/Esqueletos';
import TarjetaTicket from '../../components/ui/TarjetaTicket';
import { useToast } from '../../components/ui/ToastProvider';
import { getPromocionesVigentes } from '../../services/promociones';
import { fechaDiaMes, hoyISO } from '../../lib/fechas';
import { guardarPromo } from '../../lib/promoGuardada';
import styles from './promociones.module.css';

const DIAS_PARA_AVISAR = 3;

export default function PromocionesPage() {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: false, promociones: [] });

  useEffect(() => {
    let ignorar = false;
    getPromocionesVigentes()
      .then((promociones) => {
        if (!ignorar) setEstado({ cargando: false, error: false, promociones });
      })
      .catch(() => {
        if (!ignorar) setEstado({ cargando: false, error: true, promociones: [] });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  return (
    <section className="section">
      <title>Promociones | CineClick</title>
      <h1 className={styles.titulo}>Promociones</h1>
      <p className={styles.bajada}>Elegí una y la aplicamos sola en el paso de pago, o copiá el código.</p>

      {estado.cargando && <EsqueletoTarjetas cantidad={3} alto={300} className={styles.grilla} etiqueta="Cargando promociones" />}
      {estado.error && (
        <EstadoError
          titulo="No pudimos cargar las promociones"
          onReintentar={() => {
            setEstado({ cargando: true, error: false, promociones: [] });
            setIntento((n) => n + 1);
          }}
        />
      )}
      {!estado.cargando && !estado.error && estado.promociones.length === 0 && (
        <EstadoVacio titulo="No hay promociones activas en este momento" mensaje="Volvé a fijarte en unos días.">
          <Link to="/" className="btn btn-primary">
            Ver la cartelera
          </Link>
        </EstadoVacio>
      )}

      {estado.promociones.length > 0 && (
        <ul className={styles.grilla}>
          {estado.promociones.map((promo) => (
            <li key={promo.id}>
              <TarjetaPromocion promo={promo} />
            </li>
          ))}
        </ul>
      )}

      <section className={styles.siempre} aria-labelledby="titulo-siempre">
        <h2 id="titulo-siempre" className={styles.subtitulo}>
          Todos los días
        </h2>
        <p>
          Los menores de 12 años y los jubilados tienen precio especial en todas las funciones. Elegí el tipo de entrada
          al comprar y presentá el DNI o la credencial en el ingreso.
        </p>
      </section>
    </section>
  );
}

function diasHasta(fechaIso) {
  const desde = new Date(`${hoyISO()}T00:00:00`);
  const hasta = new Date(`${fechaIso}T00:00:00`);
  return Math.round((hasta - desde) / 86_400_000);
}

function textoVigencia(fechaFin) {
  const dias = diasHasta(fechaFin);
  if (dias > DIAS_PARA_AVISAR) return { texto: `Válida hasta el ${fechaDiaMes(fechaFin)}`, pronto: false };
  if (dias <= 0) return { texto: 'Vence hoy', pronto: true };
  return { texto: `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`, pronto: true };
}

function TarjetaPromocion({ promo }) {
  const { mostrarAviso } = useToast();
  const [copiado, setCopiado] = useState(false);
  const codigo = useRef(null);
  const vigencia = textoVigencia(promo.fechaFin);

  // Sin titulo propio (promociones viejas) se usa el codigo, asi la descripcion no repite el beneficio
  const titulo = promo.titulo || `Código ${promo.codigo}`;

  const usar = () => {
    guardarPromo(promo.codigo);
    mostrarAviso('Listo, lo vas a ver aplicado en el pago.', 'exito', { enlace: { texto: 'Ir a la cartelera ›', to: '/' } });
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(promo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin portapapeles: se selecciona el codigo para copiarlo a mano
      const seleccion = window.getSelection();
      const rango = document.createRange();
      rango.selectNodeContents(codigo.current);
      seleccion.removeAllRanges();
      seleccion.addRange(rango);
    }
  };

  const talon = (
    <div className={styles.talon}>
      <p className={styles.codigoFila}>
        <span className="visually-hidden">Código: </span>
        <span ref={codigo} className={styles.codigo}>
          {promo.codigo}
        </span>
      </p>
      <div className={styles.acciones}>
        <button type="button" className={`btn btn-primary ${styles.usar}`} onClick={usar}>
          Usar en mi compra
        </button>
        <button type="button" className={styles.copiar} onClick={copiar} aria-label={copiado ? 'Código copiado' : 'Copiar código'}>
          {copiado ? <IconoCheck /> : <IconoCopiar />}
          {copiado && <span>Copiado</span>}
        </button>
      </div>
      <p className={vigencia.pronto ? styles.vencePronto : styles.vigencia}>{vigencia.texto}</p>
    </div>
  );

  return (
    <TarjetaTicket vertical lateral={talon} className={styles.tarjeta}>
      <p className={styles.beneficio}>
        <span className={styles.porcentaje}>{Number(promo.porcentajeDescuento)}%</span>
        <span className={styles.beneficioEtiqueta}>de descuento</span>
      </p>
      <h2 className={styles.tituloPromo}>{titulo}</h2>
      {promo.descripcion && <p className={styles.condiciones}>{promo.descripcion}</p>}
    </TarjetaTicket>
  );
}

const icono = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

function IconoCopiar() {
  return (
    <svg {...icono}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg {...icono}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
