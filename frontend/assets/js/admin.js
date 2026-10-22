document.addEventListener('DOMContentLoaded', () => {
    // Verificar que sea admin
    if (typeof requireAdmin === 'function') {
        requireAdmin();
    }
    
    cargarFuncionesAdmin();
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
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay funciones</td></tr>';
            return;
        }
        
        funciones.sort((a, b) => new Date(b.fechaHoraInicio) - new Date(a.fechaHoraInicio));
        
        funciones.forEach(funcion => {
            const tr = document.createElement('tr');
            const fechaStr = fechaHoraCorta(funcion.fechaHoraInicio);
            
            tr.innerHTML = `
                <td>${funcion.id}</td>
                <td><strong>${escapeHtml(funcion.peliculaTitulo || '')}</strong></td>
                <td>${escapeHtml(funcion.cineNombre || '')} / ${escapeHtml(funcion.salaNombre || '')}</td>
                <td>${fechaStr}</td>
                <td>$${funcion.precioBase.toLocaleString('es-AR')}</td>
                <td>
                    <a href="admin-edit.html?id=${funcion.id}" class="btn btn-sm btn-warning">Modificar</a>
                    <button onclick="eliminarFuncion(${funcion.id})" class="btn btn-sm btn-danger">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
        
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

async function eliminarFuncion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta función?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/funciones/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Función eliminada correctamente');
            cargarFuncionesAdmin();
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error al eliminar función');
        }
    } catch (err) {
        alert('Error de conexión: ' + err.message);
    }
}
