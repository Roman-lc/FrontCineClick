const fondo = { fill: 'var(--tag-bg)' };
const marcaColor = { fill: 'var(--tag-text)' };

export default function LogoMarca({ marca }) {
  if (marca === 'visa') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" style={fondo} />
        <text x="20" y="16.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fontStyle="italic" style={marcaColor}>
          VISA
        </text>
      </svg>
    );
  }
  if (marca === 'mastercard') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" style={fondo} />
        <circle cx="16" cy="12" r="7" style={marcaColor} />
        <circle cx="24" cy="12" r="7" style={marcaColor} fillOpacity="0.55" />
      </svg>
    );
  }
  if (marca === 'amex') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <rect width="40" height="24" rx="4" style={fondo} />
        <text x="20" y="15.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" style={marcaColor}>
          AMEX
        </text>
      </svg>
    );
  }
  return null;
}
