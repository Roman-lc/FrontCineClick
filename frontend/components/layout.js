// Header y footer compartidos por todas las páginas.
//
// Antes cada HTML repetía el mismo <header>/<footer> (16 copias que había que
// mantener a mano). Ahora las páginas dejan un contenedor vacío y este script
// los inyecta. La única diferencia entre páginas era la profundidad de la ruta
// (raíz vs. /pages/), así que se detecta sola.
//
// Uso en el HTML:
//   <header id="siteHeader"></header>
//   ...
//   <footer id="siteFooter"></footer>
// y cargar este script (después de auth.js):
//   <script src="../components/layout.js"></script>

(function () {
    // Si la página vive dentro de /pages/ hay que subir un nivel.
    const base = window.location.pathname.includes('/pages/') ? '../' : '';

    function renderHeader() {
        const header = document.getElementById('siteHeader');
        if (!header) return;
        header.innerHTML = `
        <nav class="navbar">
            <div class="nav-brand"><a href="${base}index.html">🎬 CineClick</a></div>
            <button class="nav-toggle" id="navToggle" aria-label="Abrir menú">☰</button>
            <ul class="nav-menu" id="navMenu">
                <li><a href="${base}index.html">Inicio</a></li>
                <li><a href="${base}pages/funciones.html">Funciones</a></li>
                <li><a href="${base}pages/grupo.html">Grupo</a></li>
                <li id="navAdmin" style="display:none;"><a href="${base}pages/admin.html">Panel Admin</a></li>
                <li id="navLogin"><a href="${base}pages/login.html">Login</a></li>
                <li id="navUser" style="display:none;"><span id="userName"></span> <a href="#" id="btnLogout">Salir</a></li>
            </ul>
        </nav>`;
    }

    function renderFooter() {
        const footer = document.getElementById('siteFooter');
        if (!footer) return;
        footer.innerHTML = `<p>&copy; 2026 CineClick - TPO Aplicaciones Interactivas</p>`;
    }

    function wireToggle() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('active');
            });
        }
    }

    renderHeader();
    renderFooter();

    // El toggle necesita que el header ya esté en el DOM.
    // Este script se carga al final del <body>, así que el menú ya existe.
    wireToggle();

    // Recalcular el estado del navbar una vez inyectado el header.
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof updateNavbar === 'function') updateNavbar();
    });
})();
