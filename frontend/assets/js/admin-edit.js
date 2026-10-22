document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') {
        requireAdmin();
    }
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        alert('ID de función no especificado');
        window.location.href = 'admin.html';
        return;
    }
    
    cargarDatos(id);
    document.getElementById('btnGuardar').addEventListener('click', () => guardarFuncion(id));
});

let datosCargados = { peliculas: [], cines: [] };
let funcionActual = null;

async function cargarDatos(funcionId) {
    try {
        // Cargar función actual
        const respFuncion = await fetch(`${API_BASE_URL}/api/funciones/${funcionId}`);
        if (!respFuncion.ok) throw new Error('Error al cargar función');
        funcionActual = await respFuncion.json();
        
        // Cargar películas
        const respPelis = await fetch(`${API_BASE_URL}/api/peliculas`);
        datosCargados.peliculas = await respPelis.json();
        
        // Cargar cines
        const respCines = await fetch(`${API_BASE_URL}/api/cines`);
        datosCargados.cines = await respCines.json();
        
        poblarFormulario();
        if (typeof updateNavbar === 'function') updateNavbar();
    } catch (err) {
        alert('Error: ' + err.message);
        window.location.href = 'admin.html';
    }
}

function poblarFormulario() {
    // Películas
    const selectPeli = document.getElementById('peliculaId');
    selectPeli.innerHTML = '';
    datosCargados.peliculas.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.titulo;
        if (funcionActual.peliculaId && p.id === funcionActual.peliculaId) opt.selected = true;
        selectPeli.appendChild(opt);
    });
    
    // Cines
    const selectCine = document.getElementById('cineId');
    selectCine.innerHTML = '';
    datosCargados.cines.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        if (funcionActual.cineId && c.id === funcionActual.cineId) opt.selected = true;
        selectCine.appendChild(opt);
    });
    
    selectCine.addEventListener('change', () => {
        cargarSalas(selectCine.value, funcionActual.salaId);
    });
    
    cargarSalas(funcionActual.cineId, funcionActual.salaId);
    
    // Otros campos
    // Formatear fecha para datetime-local
    const fecha = new Date(funcionActual.fechaHoraInicio);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    document.getElementById('fechaHora').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    document.getElementById('precioBase').value = funcionActual.precioBase;
    document.getElementById('formato').value = funcionActual.formato;
    document.getElementById('idioma').value = funcionActual.idioma;
}

async function cargarSalas(cineId, salaSeleccionadaId) {
    try {
        const resp = await fetch(`${API_BASE_URL}/api/cines/${cineId}/salas`);
        const salas = await resp.json();
        const selectSala = document.getElementById('salaId');
        selectSala.innerHTML = '';
        salas.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.nombre} (${s.tipo})`;
            if (salaSeleccionadaId && s.id === salaSeleccionadaId) opt.selected = true;
            selectSala.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar salas:', err);
    }
}

async function guardarFuncion(funcionId) {
    try {
        const peliculaId = document.getElementById('peliculaId').value;
        const salaId = document.getElementById('salaId').value;
        const fechaHora = document.getElementById('fechaHora').value;
        const precioBase = document.getElementById('precioBase').value;
        const formato = document.getElementById('formato').value;
        const idioma = document.getElementById('idioma').value;
        
        if (!peliculaId || !salaId || !fechaHora || !precioBase || !formato || !idioma) {
            alert('Por favor completá todos los campos');
            return;
        }
        
        const fechaHoraISO = fechaHora + ':00';
        
        const funcionRequest = {
            peliculaId: parseInt(peliculaId),
            salaId: parseInt(salaId),
            fechaHoraInicio: fechaHoraISO,
            precioBase: parseFloat(precioBase),
            formato: formato,
            idioma: idioma
        };
        
        document.getElementById('btnGuardar').disabled = true;
        document.getElementById('btnGuardar').textContent = 'Guardando...';
        
        const response = await fetch(`${API_BASE_URL}/api/funciones/${funcionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funcionRequest)
        });
        
        if (response.ok) {
            alert('Función modificada correctamente');
            window.location.href = 'admin.html';
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error al modificar función');
            document.getElementById('btnGuardar').disabled = false;
            document.getElementById('btnGuardar').textContent = 'Guardar Cambios';
        }
    } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('btnGuardar').disabled = false;
        document.getElementById('btnGuardar').textContent = 'Guardar Cambios';
    }
}
