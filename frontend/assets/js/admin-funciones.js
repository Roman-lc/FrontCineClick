document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    cargarFuncionesAdmin();
    if (typeof updateNavbar === 'function') updateNavbar();
});

async function cargarFuncionesAdmin() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const tableBody = document.getElementById('tableBody');
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        tableBody.innerHTML = '';
        const response = await fetch(`${API_BASE_URL}/api/funciones`);
        if (!response.ok) throw new Error('Error al cargar funciones');
        const funciones = await response.json();
        loading.style.display = 'none';
        if (funciones.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay funciones</td></tr>';
            return;
        }
        funciones.sort((a, b) => new Date(b.fechaHoraInicio) - new Date(a.fechaHoraInicio));
        funciones.forEach(funcion => {
            const tr = document.createElement('tr');
            const fecha = new Date(funcion.fechaHoraInicio);
            const fechaStr = fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            tr.innerHTML = `
                <td>${funcion.id}</td>
                <td><strong>${escapeHtml(funcion.peliculaTitulo || '')}</strong></td>
                <td>${escapeHtml(funcion.cineNombre || '')} / ${escapeHtml(funcion.salaNombre || '')}</td>
                <td>${fechaStr}</td>
                <td>$${(funcion.precioBase || 0).toLocaleString('es-AR')}</td>
                <td>${escapeHtml((funcion.formato || '').toString().replace('_', 'D'))}</td>
                <td>
                    <a href="admin-edit.html?id=${funcion.id}" class="btn btn-sm btn-warning">Modificar</a>
                    <button onclick="eliminarFuncion(${funcion.id})" class="btn btn-sm btn-danger">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

async function eliminarFuncion(id) {
    if (!confirm('Â¿EstÃ¡s seguro de que deseas eliminar esta funciÃ³n?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/funciones/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('FunciÃ³n eliminada correctamente');
            cargarFuncionesAdmin();
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error al eliminar funciÃ³n');
        }
    } catch (err) {
        alert('Error de conexiÃ³n: ' + err.message);
    }
}
