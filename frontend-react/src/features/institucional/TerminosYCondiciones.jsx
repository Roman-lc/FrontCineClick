import { ACTUALIZACION_TERMINOS, SECCIONES_TERMINOS } from './contenidoTerminos';

export default function TerminosYCondiciones() {
  return (
    <>
      <p>Última actualización: {ACTUALIZACION_TERMINOS}</p>
      {SECCIONES_TERMINOS.map((s) => (
        <section key={s.id} aria-label={s.titulo}>
          <h3>{s.titulo}</h3>
          {s.contenido}
        </section>
      ))}
    </>
  );
}
