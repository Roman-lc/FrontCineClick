document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    cargarClientes();
    if (typeof updateNavbar === 'function') updateNavbar();
});

async function cargarClientes() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const tableBody = document.getElementById('tableBody');
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        tableBody.innerHTML = '';
        const response = await fetch(`${API_BASE_URL}/api/clientes`);
        if (!response.ok) throw new Error('Error al cargar clientes');
        const clientes = await response.json();
        loading.style.display = 'none';
        if (clientes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay clientes</td></tr>';
            return;
        }
        clientes.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${escapeHtml(c.nombre)}</td>
                <td>${escapeHtml(c.apellido)}</td>
                <td>${escapeHtml(c.email)}</td>
                <td>${escapeHtml(c.telefono || '-')}</td>
                <td>
                    <button onclick="eliminarCliente(${c.id})" class="btn btn-sm btn-danger">Eliminar</button>
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

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Cliente eliminado');
            cargarClientes();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al eliminar');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}
