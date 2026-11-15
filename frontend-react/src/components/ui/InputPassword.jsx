import { useState } from 'react';
import IconoOjo from './IconoOjo';

export default function InputPassword({ visible, onAlternar, controla, onKeyDown, onKeyUp, onBlur, ...input }) {
  const [visiblePropio, setVisiblePropio] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  const seVe = visible ?? visiblePropio;
  const alternar = onAlternar ?? (() => setVisiblePropio((v) => !v));
  const idAviso = `${input.id}-mayus`;

  const revisarMayusculas = (e) => {
    if (e.getModifierState) setMayusculas(e.getModifierState('CapsLock'));
  };

  const describedBy = [input['aria-describedby'], mayusculas ? idAviso : null].filter(Boolean).join(' ') || undefined;

  return (
    <>
      <div className="campo-password">
        <input
          className="form-input"
          {...input}
          aria-describedby={describedBy}
          type={seVe ? 'text' : 'password'}
          onKeyDown={(e) => {
            revisarMayusculas(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            revisarMayusculas(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setMayusculas(false);
            onBlur?.(e);
          }}
        />
        <button
          type="button"
          className="campo-password-ojo"
          aria-label={seVe ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-controls={controla ?? input.id}
          onMouseDown={(e) => e.preventDefault()}
          onClick={alternar}
        >
          <IconoOjo tachado={seVe} />
        </button>
      </div>
      {mayusculas && (
        <p id={idAviso} className="form-aviso-mayus" role="status">
          Bloq Mayús está activado
        </p>
      )}
    </>
  );
}
