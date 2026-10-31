// Distintivos simples para mostrar la marca detectada dentro del campo del numero
export default function LogoMarca({ marca }) {
  if (marca === 'visa') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" fill="#fff" />
        <text x="20" y="16.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fontStyle="italic" fill="#1a1f71">
          VISA
        </text>
      </svg>
    );
  }
  if (marca === 'mastercard') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" fill="#fff" />
        <circle cx="16" cy="12" r="7" fill="#eb001b" />
        <circle cx="24" cy="12" r="7" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    );
  }
  if (marca === 'amex') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" fill="#2e77bc" />
        <text x="20" y="15.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" fill="#fff">
          AMEX
        </text>
      </svg>
    );
  }
  return null;
}
