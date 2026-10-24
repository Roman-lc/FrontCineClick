import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrarAviso = (mensaje, tipo = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
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
                  <button type="button" className="btn btn-secondary" onClick={() => t.resolve(false)}>{t.textoCancelar}</button>
                  <button type="button" className={`btn ${t.peligro ? 'btn-danger' : 'btn-primary'}`} onClick={() => t.resolve(true)}>{t.textoOk}</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={t.id} className={`aviso aviso-${t.tipo} visible`} role={t.tipo === 'error' ? 'alert' : 'status'}>
              {t.mensaje}
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
