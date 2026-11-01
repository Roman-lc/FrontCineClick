import styles from './admin.module.css';

// Botones del pie del drawer. Guardar esta afuera del <form> (en el pie fijo), por eso usa form={id}.
export default function PieFormulario({ idFormulario, guardando, onCancelar, textoGuardar = 'Guardar' }) {
  return (
    <>
      <button type="button" className="btn" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </button>
      <button type="submit" form={idFormulario} className="btn btn-primary" disabled={guardando} aria-busy={guardando}>
        {guardando && <span className={styles.girando} aria-hidden="true" />}
        {guardando ? 'Guardando…' : textoGuardar}
      </button>
    </>
  );
}
