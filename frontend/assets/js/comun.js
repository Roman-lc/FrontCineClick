// Utilidades que comparten las páginas.
// Se cargan antes del script de cada página (ver el <script> del HTML).

// Escapa texto para poder interpolarlo dentro de innerHTML sin romper el marcado.
function escapeHtml(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
