import { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // opciones.enlace: { texto, to } muestra un enlace dentro del aviso (ej. "Ir a la cartelera")
  const mostrarAviso = (mensaje, tipo = 'info', opciones = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, mensaje, tipo, enlace: opciones.enlace }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, opciones.enlace ? 7000 : 4000);
  };

  const confirmar = (mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      const { textoOk = 'Aceptar', textoCancelar = 'Cancelar', peligro = false } = opciones;
      setToasts((t) => [...t, {
        id: 'confirm-' + Date.now(),
        tipo: 'confirm',
        mensaje,
        textoOk,
        textoCancelar,
        peligro,
        resolve: (v) => {
          setToasts((prev) => prev.filter((x) => x.tipo !== 'confirm'));
          resolve(v);
        }
      }]);
    });
  };

  return (
    <ToastContext.Provider value={{ mostrarAviso, confirmar }}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {toasts.map((t) => (
          t.tipo === 'confirm' ? (
            <div key={t.id} className="modal-overlay" style={{ position: 'fixed', inset: 0 }}>
              <div className="modal" role="alertdialog" aria-modal="true">
                <p className="modal-mensaje">{t.mensaje}</p>
                <div className="modal-acciones">
                  <button type="button" className="btn" onClick={() => t.resolve(false)}>{t.textoCancelar}</button>
                  <button type="button" className={`btn ${t.peligro === 'borrado' ? 'btn-danger-lleno' : t.peligro ? 'btn-danger' : 'btn-primary'}`} onClick={() => t.resolve(true)}>{t.textoOk}</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={t.id} className={`aviso aviso-${t.tipo} visible`} role={t.tipo === 'error' ? 'alert' : 'status'}>
              {t.mensaje}
              {t.enlace && (
                <>
                  {' '}
                  <Link to={t.enlace.to} className="aviso-enlace">
                    {t.enlace.texto}
                  </Link>
                </>
              )}
            </div>
          )
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
