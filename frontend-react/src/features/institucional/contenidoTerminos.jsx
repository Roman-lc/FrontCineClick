import { Link } from 'react-router-dom';

export const ACTUALIZACION_TERMINOS = '1 de noviembre de 2026';

export const NOTA_LEGAL = '';

const DEFENSA_CONSUMIDOR = 'https://www.argentina.gob.ar/economia/industria-y-comercio/defensadelconsumidor';

export const SECCIONES_TERMINOS = [
  {
    id: 'proveedor',
    titulo: '1. Quiénes somos',
    contenido: (
      <>
        <p>
          El sitio CineClick es operado por <strong>CineClick S.A.</strong>, CUIT 30-00000000-0, con domicilio en Lima 727, Ciudad Autónoma de Buenos Aires.
        </p>
        <p>
          Podés contactarnos desde la sección <Link to="/soporte">Ayuda</Link> o por email a hola@cineclick.com.
        </p>
      </>
    ),
  },
  {
    id: 'objeto',
    titulo: '2. Qué regulan estos términos',
    contenido: (
      <p>
        Estos términos regulan el uso del sitio y la compra de entradas de cine. Al crear una cuenta o confirmar una compra aceptás
        estos términos. Si no estás de acuerdo con alguna parte, no uses el sitio.
      </p>
    ),
  },
  {
    id: 'cuenta',
    titulo: '3. Tu cuenta',
    contenido: (
      <ul>
        <li>Los datos que cargás tienen que ser verdaderos y estar actualizados.</li>
        <li>Sos responsable de cuidar tu contraseña y de lo que se haga con tu cuenta. No la compartas.</li>
        <li>Si notás un uso que no reconocés, avisanos lo antes posible desde Ayuda.</li>
      </ul>
    ),
  },
  {
    id: 'compra',
    titulo: '4. Compra de entradas',
    contenido: (
      <ul>
        <li>Los precios que ves son finales e incluyen los impuestos. Hoy no cobramos cargo por servicio; si algún día existiera, se va a mostrar antes de pagar.</li>
        <li>Al elegir las butacas, quedan reservadas durante 8 minutos para que completes el pago. Si el tiempo se cumple, la reserva se cancela y las butacas se liberan.</li>
        <li>Podés comprar hasta 10 entradas por compra.</li>
        <li>Cuando el pago se aprueba, la compra queda confirmada y cada entrada tiene su propio código QR y código de 8 caracteres.</li>
      </ul>
    ),
  },
  {
    id: 'tipos',
    titulo: '5. Tipos de entrada y requisitos',
    contenido: (
      <p>
        Las entradas de <strong>Menor</strong> y de <strong>Jubilado</strong> tienen descuento. En el ingreso hay que presentar el DNI
        del menor o la credencial de jubilado o pensionado. Si no se presenta la documentación, se cobra la diferencia con la entrada
        General o no se permite el ingreso.
      </p>
    ),
  },
  {
    id: 'promociones',
    titulo: '6. Promociones',
    contenido: (
      <p>
        Se puede usar un solo código promocional por compra y los códigos no se acumulan. Cada promoción vale dentro de su vigencia y
        con sus condiciones particulares (días, cantidad de entradas, usos por persona o tope de usos), que se muestran en la página de
        Promociones.
      </p>
    ),
  },
  {
    id: 'calificaciones',
    titulo: '7. Calificaciones y menores',
    contenido: (
      <>
        <p>Cada película tiene una calificación que indica para qué edades es apta:</p>
        <ul>
          <li><strong>ATP:</strong> apta para todo público.</li>
          <li><strong>+13:</strong> apta para mayores de 13 años. Los menores de 13 pueden ingresar acompañados por un adulto responsable.</li>
          <li><strong>+16 y +18:</strong> aptas para mayores de 16 y de 18 años, respectivamente.</li>
        </ul>
        <p>En el ingreso se puede pedir el DNI para verificar la edad.</p>
      </>
    ),
  },
  {
    id: 'ingreso',
    titulo: '8. Ingreso a la sala',
    contenido: (
      <p>
        Para entrar hay que mostrar el código de cada entrada y el DNI del titular de la compra. Cada código sirve una sola vez. Te
        recomendamos llegar unos minutos antes: una vez que empieza la película no podemos garantizar el ingreso.
      </p>
    ),
  },
  {
    id: 'revocacion',
    titulo: '9. Botón de arrepentimiento',
    contenido: (
      <p>
        Podés revocar tu compra dentro de los 10 días corridos desde que la hiciste y hasta 60 minutos antes del inicio de la función.
        Se anulan todas las entradas de la compra y te devolvemos el importe por el mismo medio de pago. Lo podés pedir sin iniciar
        sesión desde el <Link to="/arrepentimiento">botón de arrepentimiento</Link>.
      </p>
    ),
  },
  {
    id: 'cambios-funcion',
    titulo: '10. Suspensión o cambio de una función',
    contenido: (
      <p>
        Si suspendemos o cambiamos una función (por ejemplo, por un problema técnico), te ofrecemos el reembolso total o el cambio por
        otra función, a tu elección.
      </p>
    ),
  },
  {
    id: 'conducta',
    titulo: '11. Conducta en la sala',
    contenido: (
      <p>
        Pedimos respeto por el resto del público y por el personal. Está prohibido grabar, filmar o fotografiar la proyección. Podemos
        pedir que se retire quien no respete estas reglas.
      </p>
    ),
  },
  {
    id: 'responsabilidad',
    titulo: '12. Responsabilidad',
    contenido: (
      <p>
        Hacemos lo posible para que el sitio funcione sin interrupciones y con información correcta, pero puede haber fallas técnicas o
        errores. No somos responsables por problemas de tu conexión o de tu dispositivo, ni por pérdidas que no sean consecuencia directa
        de un incumplimiento nuestro. Nada de esto limita los derechos que te da la ley.
      </p>
    ),
  },
  {
    id: 'modificaciones',
    titulo: '13. Cambios en estos términos',
    contenido: (
      <p>
        Podemos actualizar estos términos. La fecha de la última actualización figura arriba. Los cambios no afectan las compras que ya
        estén confirmadas.
      </p>
    ),
  },
  {
    id: 'ley',
    titulo: '14. Ley aplicable',
    contenido: (
      <p>
        Estos términos se rigen por las leyes de la República Argentina, sin perjuicio de los derechos que la Ley 24.240 de Defensa del
        Consumidor te reconoce, incluida la posibilidad de reclamar ante los tribunales de tu domicilio.
      </p>
    ),
  },
  {
    id: 'consumidor',
    titulo: '15. Defensa del consumidor',
    contenido: (
      <p>
        Si tenés un reclamo que no resolvimos, podés presentarlo en el sitio oficial de{' '}
        <a href={DEFENSA_CONSUMIDOR} target="_blank" rel="noopener noreferrer">
          Defensa de las y los consumidores<span className="visually-hidden"> (se abre en otra pestaña)</span>
        </a>
        .
      </p>
    ),
  },
];
