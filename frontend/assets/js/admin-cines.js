document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    cargarCines();
    if (typeof updateNavbar === 'function') updateNavbar();
});

async function cargarCines() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const cinesList = document.getElementById('cinesList');
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        cinesList.innerHTML = '';
        const response = await fetch(`${API_BASE_URL}/api/cines`);
        if (!response.ok) throw new Error('Error al cargar cines');
        const cines = await response.json();
        loading.style.display = 'none';
        if (cines.length === 0) {
            cinesList.innerHTML = '<p style="color: var(--text-light);">No hay cines</p>';
            return;
        }
        for (const cine of cines) {
            const salasResp = await fetch(`${API_BASE_URL}/api/cines/${cine.id}/salas`);
            const salas = salasResp.ok ? await salasResp.json() : [];
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="card-header">
                    <strong>${escapeHtml(cine.nombre)}</strong>
                    <div>
                        <button class="btn btn-sm btn-warning" onclick="editarCineByObj(${cine.id})">Modificar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarCine(${cine.id})">Eliminar</button>
                    </div>
                </div>
                <div class="card-body">
                    <p><strong>DirecciÃ³n:</strong> ${escapeHtml(cine.direccion)}, ${escapeHtml(cine.ciudad)}</p>
                    <p><strong>TelÃ©fono:</strong> ${escapeHtml(cine.telefono || '-')}</p>
                    <h4 style="margin-top: 0.75rem;">Salas (${salas.length})</h4>
                    <div class="table-container" style="margin-top: 0.5rem;">
                        <table class="table">
                            <thead><tr><th>Nombre</th><th>NÃºmero</th><th>Tipo</th><th>Butacas</th></tr></thead>
                            <tbody>
                                ${salas.map(s => `<tr><td>${escapeHtml(s.nombre)}</td><td>${s.numero}</td><td>${escapeHtml(s.tipo)}</td><td>${(s.butacas||[]).length}</td></tr>`).join('') || '<tr><td colspan="4">Sin salas</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            cinesList.appendChild(div);
        }
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

function mostrarFormularioCine() {
    document.getElementById('formCine').style.display = 'block';
    document.getElementById('cineId').value = '';
    document.getElementById('cineNombre').value = '';
    document.getElementById('cineDireccion').value = '';
    document.getElementById('cineCiudad').value = '';
    document.getElementById('cineTelefono').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function editarCine(cine) {
    document.getElementById('formCine').style.display = 'block';
    document.getElementById('cineId').value = cine.id;
    document.getElementById('cineNombre').value = cine.nombre || '';
    document.getElementById('cineDireccion').value = cine.direccion || '';
    document.getElementById('cineCiudad').value = cine.ciudad || '';
    document.getElementById('cineTelefono').value = cine.telefono || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editarCineByObj(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cines/${id}`);
        if (response.ok) {
            const c = await response.json();
            editarCine(c);
        }
    } catch (e) {
        console.error(e);
    }
}

async function guardarCine() {
    const id = document.getElementById('cineId').value;
    const data = {
        nombre: document.getElementById('cineNombre').value,
        direccion: document.getElementById('cineDireccion').value,
        ciudad: document.getElementById('cineCiudad').value,
        telefono: document.getElementById('cineTelefono').value || null
    };
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/api/cines/${id}` : `${API_BASE_URL}/api/cines`;
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (response.ok) {
            alert(id ? 'Cine actualizado' : 'Cine creado');
            document.getElementById('formCine').style.display = 'none';
            cargarCines();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al guardar cine');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function eliminarCine(id) {
    if (!confirm('Â¿Eliminar este cine?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/cines/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Cine eliminado');
            cargarCines();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al eliminar');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
}
