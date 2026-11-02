import { Link } from 'react-router-dom';
import { NOTA_LEGAL } from './contenidoTerminos';
import PaginaLectura from './PaginaLectura';
import styles from './lectura.module.css';

const SECCIONES = [
  {
    id: 'responsable',
    titulo: '1. Responsable del tratamiento',
    contenido: (
      <p>
        El responsable de tus datos es <strong>CineClick S.A.</strong> (empresa ficticia), con domicilio en Av. Ficticia 1234, Ciudad
        Autónoma de Buenos Aires. Para cualquier tema sobre tus datos escribinos a datos@cineclick.example.
      </p>
    ),
  },
  {
    id: 'datos',
    titulo: '2. Qué datos guardamos',
    contenido: (
      <>
        <ul>
          <li>
            <strong>Tu cuenta:</strong> nombre, apellido, email, contraseña, teléfono (si lo cargás) y la fecha de registro.
          </li>
          <li>
            <strong>Tus compras:</strong> la función, las butacas, los tipos de entrada, el código promocional si usaste uno, los totales
            y el estado de cada entrada (por ejemplo, si ya se usó para entrar). Del pago guardamos el medio, la marca de la tarjeta, los
            últimos 4 dígitos, la fecha y un código de transacción.
          </li>
          <li>
            <strong>Lo que nunca guardamos:</strong> el número completo de la tarjeta, el vencimiento ni el código de seguridad. El DNI
            del titular se pide en el formulario de pago para validarlo, pero no se envía ni se guarda.
          </li>
          <li>
            <strong>Lista de espera:</strong> las películas en las que te anotaste para que te avisemos.
          </li>
          <li>
            <strong>Solicitudes:</strong> en el botón de arrepentimiento, tu nombre, email, la compra y el motivo; en Ayuda, tu nombre,
            email, el motivo, el mensaje y la compra si la indicás.
          </li>
          <li>
            <strong>En tu navegador:</strong> en el almacenamiento local (localStorage) guardamos tu sesión (nombre, apellido, email y
            rol) hasta que cerrás sesión; en el almacenamiento de la pestaña (sessionStorage), la compra en curso y el código
            promocional que elegiste, que se borran al cerrar la pestaña.
          </li>
        </ul>
        <p>
          <strong>Cookies y servicios de terceros:</strong> el sitio no usa cookies propias. Sí carga contenido de terceros que puede
          registrar tu dirección IP o usar sus propias cookies: el mapa de Google Maps en la página de cada cine, las tipografías de
          Google Fonts y los pósters de las películas, que se sirven desde Wikimedia.
        </p>
      </>
    ),
  },
  {
    id: 'uso',
    titulo: '3. Para qué los usamos',
    contenido: (
      <ul>
        <li>Gestionar tu cuenta y tus compras, y mostrarte tus entradas.</li>
        <li>Validar tus entradas en el ingreso a la sala.</li>
        <li>Atender tus solicitudes de arrepentimiento y tus consultas.</li>
        <li>Enviarte novedades de estrenos y promociones, solo si nos diste tu consentimiento expreso.</li>
      </ul>
    ),
  },
  {
    id: 'consentimiento',
    titulo: '4. Consentimiento',
    contenido: (
      <p>
        Al crear tu cuenta y al comprar nos das tu consentimiento libre, expreso e informado para usar tus datos con los fines de la
        sección anterior. Recibir novedades es opcional: se elige con una casilla aparte y podés revocarlo cuando quieras. (En esta
        versión del proyecto esa preferencia todavía no se guarda.)
      </p>
    ),
  },
  {
    id: 'compartir',
    titulo: '5. Con quién los compartimos',
    contenido: (
      <p>
        Solo con los proveedores que necesitamos para prestar el servicio (por ejemplo, el procesador de pagos), y únicamente con los
        datos que cada uno necesita. No vendemos ni alquilamos tus datos.
      </p>
    ),
  },
  {
    id: 'conservacion',
    titulo: '6. Cuánto tiempo los guardamos',
    contenido: (
      <ul>
        <li>Los datos de tu cuenta, mientras la cuenta esté activa.</li>
        <li>Las compras y los pagos, durante el plazo que exigen las normas contables y fiscales.</li>
        <li>Las solicitudes y consultas, hasta dos años después de resueltas.</li>
      </ul>
    ),
  },
  {
    id: 'seguridad',
    titulo: '7. Seguridad',
    contenido: (
      <p>
        Tomamos medidas técnicas y organizativas para proteger tus datos: la contraseña no se guarda tal como la escribís sino como
        un hash con BCrypt (no se puede volver a leer, solo comprobar al iniciar sesión), no guardamos los datos completos de la
        tarjeta, el panel de administración está restringido al personal autorizado y solo se accede a tus datos cuando hace falta
        para atenderte. Al ser un proyecto académico, estas medidas son de ejemplo y no equivalen a las de un servicio en producción:
        por ejemplo, la sesión no usa tokens.
      </p>
    ),
  },
  {
    id: 'derechos',
    titulo: '8. Tus derechos',
    contenido: (
      <>
        <p>
          Podés pedir el acceso, la rectificación, la actualización o la supresión de tus datos escribiendo a datos@cineclick.example.
          Respondemos los pedidos de acceso dentro de los 10 días corridos y los de rectificación, actualización o supresión dentro de
          los 5 días hábiles, como establece la ley.
        </p>
        <p className={styles.cita}>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a
          intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el
          artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control
          de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus
          derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </>
    ),
  },
  {
    id: 'baja',
    titulo: '9. Dejar de recibir novedades',
    contenido: (
      <p>
        Si te suscribiste a las novedades, podés darte de baja en cualquier momento desde el enlace que va al pie de cada email o
        escribiéndonos desde <Link to="/soporte">Ayuda</Link>.
      </p>
    ),
  },
  {
    id: 'cambios',
    titulo: '10. Cambios en esta política',
    contenido: (
      <p>
        Si cambiamos esta política, actualizamos la fecha de arriba. Si el cambio es importante, te lo avisamos antes de que se aplique.
      </p>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <PaginaLectura
      titulo="Política de privacidad"
      bajada="Qué datos guardamos, para qué los usamos y cómo podés ejercer tus derechos (Ley 25.326)."
      actualizado="1 de noviembre de 2026"
      secciones={SECCIONES}
      notaFinal={NOTA_LEGAL}
    />
  );
}
