// Configuración de la API.
// Por defecto apunta al backend local, pero se puede pisar sin tocar código:
//   1) ?api=https://otro-host:8080   en la URL
//   2) window.CINECLICK_API (definido en un <script> antes de auth.js)
// El valor se normaliza sin barra final para poder concatenar `${API_BASE_URL}/api/...`.
const API_BASE_URL = (function () {
    const porQuery = new URLSearchParams(window.location.search).get('api');
    const porGlobal = typeof window.CINECLICK_API === 'string' ? window.CINECLICK_API : '';
    const base = porQuery || porGlobal || 'http://localhost:8080';
    return base.replace(/\/+$/, '');
})();

// Verificar autenticación y actualizar navbar
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    const navAdmin = document.getElementById('navAdmin');
    const navLogin = document.getElementById('navLogin');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    const btnLogout = document.getElementById('btnLogout');
    
    if (user) {
        if (navLogin) navLogin.style.display = 'none';
        if (navUser) {
            navUser.style.display = 'flex';
            navUser.style.alignItems = 'center';
            navUser.style.gap = '0.5rem';
        }
        if (userName) userName.textContent = user.nombre || user.email;
        
        // Mostrar panel admin solo si es ADMIN
        if (user.rol === 'ADMIN' && navAdmin) {
            navAdmin.style.display = 'block';
        } else if (navAdmin) {
            navAdmin.style.display = 'none';
        }
        
        if (btnLogout) {
            btnLogout.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('cineclick_user');
                localStorage.removeItem('cineclick_token');
                window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
            };
        }
    } else {
        if (navLogin) navLogin.style.display = 'block';
        if (navUser) navUser.style.display = 'none';
        if (navAdmin) navAdmin.style.display = 'none';
    }
}

// Verificar si es admin (para páginas protegidas)
function requireAdmin() {
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (!user || user.rol !== 'ADMIN') {
        alert('Acceso denegado. Solo usuarios administradores pueden acceder.');
        // Las páginas admin viven en /pages/, así que el landing está un nivel arriba.
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        return false;
    }
    return true;
}

// Obtener usuario actual
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('cineclick_user') || 'null');
}

// Actualizar navbar al cargar
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
