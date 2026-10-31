// Iconos del flujo de compra. Son decorativos: el texto accesible lo pone el boton o el renglon que los usa.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function IconoAtras({ tamano = 22 }) {
  return (
    <svg {...base} width={tamano} height={tamano}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconoCerrar({ tamano = 22 }) {
  return (
    <svg {...base} width={tamano} height={tamano}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconoCalendario({ tamano = 20 }) {
  return (
    <svg {...base} width={tamano} height={tamano}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function IconoEntrada({ tamano = 20 }) {
  return (
    <svg {...base} width={tamano} height={tamano}>
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M13 6v2M13 11v2M13 16v2" />
    </svg>
  );
}

export function IconoSillaDeRuedas({ tamano = 14 }) {
  return (
    <svg {...base} width={tamano} height={tamano} strokeWidth={2.2}>
      <circle cx="11" cy="4" r="1.6" />
      <path d="M11 7.5v6h5l2.5 5" />
      <path d="M8 10.5a5.5 5.5 0 1 0 7.5 7" />
    </svg>
  );
}

export function IconoOcupada({ tamano = 12 }) {
  return (
    <svg {...base} width={tamano} height={tamano} strokeWidth={2.6}>
      <path d="M17 7L7 17M7 7l10 10" />
    </svg>
  );
}

export function IconoTarjeta({ tamano = 22 }) {
  return (
    <svg {...base} width={tamano} height={tamano}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  );
}

export function IconoFlecha({ tamano = 16, abierto = false }) {
  return (
    <svg {...base} width={tamano} height={tamano} style={{ transform: abierto ? 'rotate(180deg)' : undefined }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
