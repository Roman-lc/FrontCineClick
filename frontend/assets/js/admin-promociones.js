document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    cargarPromociones();
    if (typeof updateNavbar === 'function') updateNavbar();
});

async function cargarPromociones() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const tableBody = document.getElementById('tableBody');
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        tableBody.innerHTML = '';
        const response = await fetch(`${API_BASE_URL}/api/promociones`);
        if (!response.ok) throw new Error('Error al cargar promociones');
        const promociones = await response.json();
        loading.style.display = 'none';
        if (promociones.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay promociones</td></tr>';
            return;
        }
        promociones.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><strong>${escapeHtml(p.codigo)}</strong></td>
                <td>${escapeHtml(p.descripcion)}</td>
                <td>${p.porcentajeDescuento}%</td>
                <td>${p.fechaInicio} - ${p.fechaFin}</td>
                <td>${p.activa !== false ? 'Sí' : 'No'}</td>
                <td>
                    <button onclick="editarPromoById(${p.id})" class="btn btn-sm btn-warning">Modificar</button>
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

function mostrarFormulario() {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('promoId').value = '';
    document.getElementById('codigo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('porcentajeDescuento').value = '';
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    document.getElementById('activa').checked = true;
}

function ocultarFormulario() {
    document.getElementById('formContainer').style.display = 'none';
}

function editarPromo(p) {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('promoId').value = p.id;
    document.getElementById('codigo').value = p.codigo || '';
    document.getElementById('descripcion').value = p.descripcion || '';
    document.getElementById('porcentajeDescuento').value = p.porcentajeDescuento || '';
    document.getElementById('fechaInicio').value = p.fechaInicio || '';
    document.getElementById('fechaFin').value = p.fechaFin || '';
    document.getElementById('activa').checked = p.activa !== false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editarPromoById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/promociones`);
        if (response.ok) {
            const promos = await response.json();
            const p = promos.find(x => x.id == id);
            if (p) editarPromo(p);
        }
    } catch (e) {
        console.error(e);
    }
}

async function guardarPromo() {
    const id = document.getElementById('promoId').value;
    const data = {
        codigo: document.getElementById('codigo').value,
        descripcion: document.getElementById('descripcion').value,
        porcentajeDescuento: parseFloat(document.getElementById('porcentajeDescuento').value),
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: document.getElementById('fechaFin').value,
        activa: document.getElementById('activa').checked
    };
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/api/promociones/${id}` : `${API_BASE_URL}/api/promociones`;
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert(id ? 'Promoción actualizada' : 'Promoción creada');
            ocultarFormulario();
            cargarPromociones();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al guardar promoción');
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
