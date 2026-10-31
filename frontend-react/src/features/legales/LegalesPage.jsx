import { TerminosYCondiciones } from '../compra/TextosCompra';
import styles from './legales.module.css';

// Textos legales genericos del proyecto. tipo: 'terminos' | 'privacidad' | 'arrepentimiento'
const PAGINAS = {
  terminos: { titulo: 'Términos y condiciones', Contenido: TerminosYCondiciones },
  privacidad: { titulo: 'Política de privacidad', Contenido: Privacidad },
  arrepentimiento: { titulo: 'Botón de arrepentimiento', Contenido: Arrepentimiento },
};

export default function LegalesPage({ tipo }) {
  const { titulo, Contenido } = PAGINAS[tipo];
  return (
    <section className={`section ${styles.legales}`}>
      <title>{`${titulo} | CineClick`}</title>
      <h1 className={styles.titulo}>{titulo}</h1>
      <div className={styles.texto}>
        <Contenido />
      </div>
    </section>
  );
}

function Privacidad() {
  return (
    <>
      <h3>Qué datos guardamos</h3>
      <p>
        Nombre, apellido, email y teléfono (si lo cargás) de tu cuenta, y el detalle de tus compras. De la tarjeta solo
        guardamos la marca y los últimos 4 dígitos: el número completo, el vencimiento y el código de seguridad no se guardan.
      </p>
      <h3>Para qué los usamos</h3>
      <p>
        Para gestionar tus compras, mostrarte tus entradas y, si lo pediste, avisarte de estrenos y de la salida a la venta
        de las películas en las que te anotaste.
      </p>
      <h3>Tus derechos</h3>
      <p>
        Podés pedir el acceso, la rectificación o la eliminación de tus datos en cualquier momento, como prevé la Ley 25.326
        de Protección de los Datos Personales.
      </p>
    </>
  );
}

function Arrepentimiento() {
  return (
    <>
      <p>
        Si compraste a distancia, tenés derecho a revocar la compra dentro de los 10 días corridos, como prevé el artículo 34
        de la Ley 24.240 de Defensa del Consumidor, siempre que la función no haya comenzado.
      </p>
      <h3>Cómo pedirlo</h3>
      <p>
        Indicá el número de compra que figura en la confirmación y el email de tu cuenta. Te vamos a confirmar la recepción
        del pedido y el reintegro se hace por el mismo medio de pago.
      </p>
    </>
  );
}
