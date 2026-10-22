document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAdmin === 'function') {
        requireAdmin();
    }
    
    cargarDatos();
    document.getElementById('btnGuardar').addEventListener('click', guardarFuncion);
});

async function cargarDatos() {
    try {
        // Cargar películas
        const respPelis = await fetch(`${API_BASE_URL}/api/peliculas`);
        const peliculas = await respPelis.json();
        const selectPeli = document.getElementById('peliculaId');
        peliculas.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.titulo;
            selectPeli.appendChild(opt);
        });
        
        // Cargar cines
        const respCines = await fetch(`${API_BASE_URL}/api/cines`);
        const cines = await respCines.json();
        const selectCine = document.getElementById('cineId');
        cines.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nombre;
            selectCine.appendChild(opt);
        });
        
        selectCine.addEventListener('change', () => {
            const cineId = selectCine.value;
            cargarSalas(cineId);
        });
        
        if (cines.length > 0) {
            cargarSalas(cines[0].id);
        }
        
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    } catch (err) {
        alert('Error al cargar datos: ' + err.message);
    }
}

async function cargarSalas(cineId) {
    try {
        const resp = await fetch(`${API_BASE_URL}/api/cines/${cineId}/salas`);
        const salas = await resp.json();
        const selectSala = document.getElementById('salaId');
        selectSala.innerHTML = '<option value="">Seleccionar...</option>';
        salas.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.nombre} (${s.tipo})`;
            selectSala.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar salas:', err);
    }
}

async function guardarFuncion() {
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
        
        // Convertir datetime-local a formato ISO
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
        
        const response = await fetch(`${API_BASE_URL}/api/funciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funcionRequest)
        });
        
        if (response.ok) {
            alert('Función creada correctamente');
            window.location.href = 'admin.html';
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error al crear función');
            document.getElementById('btnGuardar').disabled = false;
            document.getElementById('btnGuardar').textContent = 'Guardar Función';
        }
    } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('btnGuardar').disabled = false;
        document.getElementById('btnGuardar').textContent = 'Guardar Función';
    }
}
