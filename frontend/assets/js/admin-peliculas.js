document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') requireAdmin();
    cargarPeliculas();
    if (typeof updateNavbar === 'function') updateNavbar();
});

async function cargarPeliculas() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const tableBody = document.getElementById('tableBody');
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        tableBody.innerHTML = '';
        const response = await fetch(`${API_BASE_URL}/api/peliculas`);
        if (!response.ok) throw new Error('Error al cargar pelÃ­culas');
        const peliculas = await response.json();
        loading.style.display = 'none';
        if (peliculas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay pelÃ­culas</td></tr>';
            return;
        }
        peliculas.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><strong>${escapeHtml(p.titulo)}</strong></td>
                <td>${escapeHtml(p.genero)}</td>
                <td>${p.duracionMinutos} min</td>
                <td>${escapeHtml(p.clasificacion)}</td>
                <td>${p.activa !== false ? 'SÃ­' : 'No'}</td>
                <td>
                    <button onclick="editarPeliculaByObj(${p.id})" class="btn btn-sm btn-warning">Modificar</button>
                    <button onclick="eliminarPelicula(${p.id})" class="btn btn-sm btn-danger">Eliminar</button>
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
    document.getElementById('peliculaId').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('sinopsis').value = '';
    document.getElementById('duracionMinutos').value = '';
    document.getElementById('clasificacion').value = '';
    document.getElementById('genero').value = 'ACCION';
    document.getElementById('idioma').value = '';
    document.getElementById('urlPoster').value = '';
    document.getElementById('fechaEstreno').value = '';
    document.querySelectorAll('.formatoChk').forEach(c => c.checked = false);
    document.getElementById('activa').checked = true;
}

function ocultarFormulario() {
    document.getElementById('formContainer').style.display = 'none';
}

function editarPelicula(p) {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('peliculaId').value = p.id;
    document.getElementById('titulo').value = p.titulo || '';
    document.getElementById('sinopsis').value = p.sinopsis || '';
    document.getElementById('duracionMinutos').value = p.duracionMinutos || '';
    document.getElementById('clasificacion').value = p.clasificacion || '';
    document.getElementById('genero').value = p.genero || 'ACCION';
    document.getElementById('idioma').value = p.idioma || '';
    document.getElementById('urlPoster').value = p.urlPoster || '';
    document.getElementById('fechaEstreno').value = p.fechaEstreno || '';
    document.querySelectorAll('.formatoChk').forEach(c => {
        c.checked = p.formatosDisponibles && p.formatosDisponibles.includes(c.value);
    });
    document.getElementById('activa').checked = p.activa !== false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editarPeliculaByObj(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/peliculas/${id}`);
        if (response.ok) {
            const p = await response.json();
            editarPelicula(p);
        }
    } catch (e) {
        console.error(e);
    }
}

async function guardarPelicula() {
    const id = document.getElementById('peliculaId').value;
    const formatos = [];
    document.querySelectorAll('.formatoChk:checked').forEach(c => formatos.push(c.value));
    if (formatos.length === 0) {
        alert('SeleccionÃ¡ al menos un formato');
        return;
    }
    const data = {
        titulo: document.getElementById('titulo').value,
        sinopsis: document.getElementById('sinopsis').value,
        duracionMinutos: parseInt(document.getElementById('duracionMinutos').value),
        clasificacion: document.getElementById('clasificacion').value,
        genero: document.getElementById('genero').value,
        idioma: document.getElementById('idioma').value,
        formatosDisponibles: formatos,
        urlPoster: document.getElementById('urlPoster').value || null,
        fechaEstreno: document.getElementById('fechaEstreno').value || null
    };
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/api/peliculas/${id}` : `${API_BASE_URL}/api/peliculas`;
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert(id ? 'PelÃ­cula actualizada' : 'PelÃ­cula creada');
            ocultarFormulario();
            cargarPeliculas();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al guardar pelÃ­cula');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function eliminarPelicula(id) {
    if (!confirm('Â¿Eliminar esta pelÃ­cula?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/peliculas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('PelÃ­cula eliminada');
            cargarPeliculas();
        } else {
            const err = await response.json();
            alert(err.mensaje || 'Error al eliminar');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
}
