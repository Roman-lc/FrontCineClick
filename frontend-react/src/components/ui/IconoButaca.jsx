// Decorativo; toma el color del texto (currentColor) para mostrar la disponibilidad.
export default function IconoButaca({ tamano = 16 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7H6z" />
      <path d="M3 10a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2v3h-2v-3H7v3H5v-3a2 2 0 0 1-2-2z" />
    </svg>
  );
}
