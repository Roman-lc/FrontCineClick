import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PREGUNTA = {
  titulo: 'Tenés cambios sin guardar',
  mensaje: 'Si salís de la página, se pierden los cambios que no guardaste.',
  textoConfirmar: 'Salir sin guardar',
  textoCancelar: 'Seguir editando',
};

export function useCambiosSinGuardar(sucio, confirmar) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sucio) return undefined;

    const antesDeSalir = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const alHacerClic = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const enlace = e.target.closest?.('a[href]');
      if (!enlace || enlace.target === '_blank' || enlace.hasAttribute('download')) return;
      const destino = new URL(enlace.href, window.location.href);
      if (destino.origin !== window.location.origin || destino.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      confirmar(PREGUNTA).then((salir) => {
        if (salir) navigate(destino.pathname + destino.search + destino.hash);
      });
    };

    window.addEventListener('beforeunload', antesDeSalir);
    document.addEventListener('click', alHacerClic, true);
    return () => {
      window.removeEventListener('beforeunload', antesDeSalir);
      document.removeEventListener('click', alHacerClic, true);
    };
  }, [sucio, confirmar, navigate]);
}
