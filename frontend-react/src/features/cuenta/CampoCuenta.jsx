export default function CampoCuenta({ id, etiqueta, error, ayuda, extra, children }) {
  const idTexto = `${id}-texto`;
  const textoDebajo = error || ayuda;
  return (
    <div className="form-group">
      {extra ? (
        <div className="form-label-fila">
          <label htmlFor={id}>{etiqueta}</label>
          {extra}
        </div>
      ) : (
        <label htmlFor={id}>{etiqueta}</label>
      )}
      {children({ id, 'aria-describedby': textoDebajo ? idTexto : undefined, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={idTexto} className="form-error" data-icono="error">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={idTexto} className="form-ayuda">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}
