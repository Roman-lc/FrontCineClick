// Iconos de linea para las acciones del panel (24x24, heredan el color del texto)
function Icono({ children, tamano = 18 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const IconoEditar = () => (
  <Icono>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Icono>
);

export const IconoDesactivar = () => (
  <Icono>
    <path d="M17.9 17.9A10 10 0 0112 20c-7 0-10-8-10-8a18 18 0 015.1-5.9M9.9 4.2A9 9 0 0112 4c7 0 10 8 10 8a18 18 0 01-2.2 3.2M14.1 14.1a3 3 0 01-4.2-4.2" />
    <path d="M2 2l20 20" />
  </Icono>
);

export const IconoActivar = () => (
  <Icono>
    <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icono>
);

export const IconoEliminar = () => (
  <Icono>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </Icono>
);

export const IconoCancelar = () => (
  <Icono>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </Icono>
);

export const IconoBuscar = () => (
  <Icono tamano={16}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icono>
);

export const IconoCerrar = () => (
  <Icono tamano={20}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icono>
);

export const IconoMas = () => (
  <Icono tamano={16}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
);
