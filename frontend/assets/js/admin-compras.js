document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    // No hay endpoint directo para listar todas las compras, mostramos info
    document.getElementById('loading').style.display = 'none';
    document.getElementById('comprasList').innerHTML = '<div class="alert alert-info">Para ver compras específicas, buscar por ID desde el backend o usar los endpoints: GET /api/compras/{id}</div>';
    if (typeof updateNavbar === 'function') updateNavbar();
});
