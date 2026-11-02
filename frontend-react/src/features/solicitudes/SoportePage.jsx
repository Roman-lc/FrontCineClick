import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { enviarSoporte } from '../../services/solicitudes';
import FormularioSolicitud from './FormularioSolicitud';
import styles from './solicitud.module.css';

const CAMPOS = [
  { nombre: 'nombre', tipo: 'texto', etiqueta: 'Nombre', autoComplete: 'name', vacio: 'Completá tu nombre' },
  { nombre: 'email', tipo: 'email', etiqueta: 'Email', vacio: 'Completá tu email para que podamos responderte' },
  {
    nombre: 'motivo',
    tipo: 'select',
    etiqueta: 'Motivo',
    vacio: 'Elegí el motivo de tu consulta',
    opciones: [
      { valor: 'PROBLEMA_COMPRA', texto: 'Problema con mi compra' },
      { valor: 'PAGO', texto: 'Pago' },
      { valor: 'CUENTA', texto: 'Mi cuenta' },
      { valor: 'SUGERENCIA', texto: 'Sugerencia' },
      { valor: 'OTRO', texto: 'Otro' },
    ],
  },
  {
    nombre: 'codigo',
    tipo: 'codigo',
    etiqueta: 'Número de compra o código de entrada',
    opcional: true,
    ayuda: 'Si tu consulta es sobre una compra, nos ayuda a encontrarla más rápido.',
  },
  {
    nombre: 'mensaje',
    tipo: 'textarea',
    etiqueta: 'Mensaje',
    minimo: 20,
    maximo: 1000,
    vacio: 'Contanos en qué te podemos ayudar',
  },
];

export default function SoportePage() {
  // Clave de idempotencia de este formulario: dos envios iguales no crean dos consultas
  const clave = useRef(crypto.randomUUID());

  return (
    <section className={`section ${styles.pagina}`}>
      <title>Ayuda | CineClick</title>
      <h1 className={styles.titulo}>Ayuda</h1>
      <p className={styles.bajada}>
        Escribinos por cualquier problema con una compra, el pago o tu cuenta, o si tenés una sugerencia. Si querés anular una compra,
        usá el <Link to="/arrepentimiento">botón de arrepentimiento</Link>.
      </p>
      <FormularioSolicitud
        campos={CAMPOS}
        textoEnviar="Enviar consulta"
        enviar={(valores) =>
          enviarSoporte({
            nombre: valores.nombre,
            email: valores.email,
            motivo: valores.motivo,
            codigo: valores.codigo || null,
            mensaje: valores.mensaje,
            claveIdempotencia: clave.current,
          })
        }
        exito={(consulta) => ({
          titulo: 'Recibimos tu consulta',
          numero: consulta.numero,
          mensaje: (
            <>
              <p>Te respondemos por email dentro de las próximas 48 horas hábiles.</p>
              <p>Si nos volvés a escribir por el mismo tema, mencioná este número.</p>
            </>
          ),
          acciones: (
            <Link to="/" className="btn btn-primary">
              Volver a la cartelera
            </Link>
          ),
        })}
      />
    </section>
  );
}
