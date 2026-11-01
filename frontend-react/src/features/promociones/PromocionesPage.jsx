import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import { useToast } from '../../components/ui/ToastProvider';
import { getPromociones } from '../../services/promociones';
import { fechaLarga, hoyISO } from '../../lib/fechas';
import styles from './promociones.module.css';

export default function PromocionesPage() {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: '', promociones: [] });

  useEffect(() => {
    let ignorar = false;
    getPromociones()
      .then((promociones) => {
        if (!ignorar) setEstado({ cargando: false, error: '', promociones });
      })
      .catch((err) => {
        if (!ignorar) setEstado({ cargando: false, error: err.message, promociones: [] });
      });
    return () => {
      ignorar = true;
    };
  }, [intento]);

  // El backend devuelve las activas; ademas se descartan las que ya vencieron o todavia no empezaron
  const hoy = hoyISO();
  const vigentes = estado.promociones.filter((p) => p.fechaInicio <= hoy && p.fechaFin >= hoy);

  return (
    <section className="section">
      <title>Promociones | CineClick</title>
      <h1 className={styles.titulo}>Promociones</h1>
      <p className={styles.bajada}>Ingresá el código en el paso de pago, antes de confirmar la compra.</p>

      {estado.cargando && <Cargando texto="Cargando promociones..." />}
      {estado.error && (
        <MensajeError
          mensaje={estado.error}
          onReintentar={() => {
            setEstado({ cargando: true, error: '', promociones: [] });
            setIntento((n) => n + 1);
          }}
        />
      )}
      {!estado.cargando && !estado.error && vigentes.length === 0 && (
        <EstadoVacio mensaje="No hay promociones vigentes por ahora." />
      )}

      <ul className={styles.grilla}>
        {vigentes.map((promo) => (
          <li key={promo.id}>
            <TarjetaPromocion promo={promo} />
          </li>
        ))}
      </ul>

      <section className={styles.siempre} aria-labelledby="titulo-siempre">
        <h2 id="titulo-siempre" className={styles.subtitulo}>
          Todos los días
        </h2>
        <p>
          Los menores de 12 años y los jubilados tienen precio especial en todas las funciones. Elegí el tipo de entrada
          al comprar y presentá el DNI o la credencial en el ingreso.
        </p>
        <Link to="/" className="btn btn-primary">
          Ver la cartelera
        </Link>
      </section>
    </section>
  );
}

function TarjetaPromocion({ promo }) {
  const { mostrarAviso } = useToast();

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(promo.codigo);
      mostrarAviso(`Código ${promo.codigo} copiado`, 'exito');
    } catch {
      mostrarAviso(`No se pudo copiar. El código es ${promo.codigo}`, 'info');
    }
  };

  return (
    <article className={styles.tarjeta}>
      <p className={styles.descuento}>
        <span className={styles.porcentaje}>{Number(promo.porcentajeDescuento)}%</span>
        <span className={styles.off}>de descuento</span>
      </p>
      <p className={styles.descripcion}>{promo.descripcion}</p>
      <div className={styles.codigoFila}>
        <span className={styles.codigo} aria-label={`Código ${promo.codigo}`}>
          {promo.codigo}
        </span>
        <button type="button" className="btn btn-sm" onClick={copiar}>
          Copiar código
        </button>
      </div>
      <p className={styles.vigencia}>Válida hasta el {fechaLarga(promo.fechaFin)}</p>
    </article>
  );
}
