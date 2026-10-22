document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'ID de función no especificado';
        return;
    }
    
    cargarDetalleFuncion(id);
});

async function cargarDetalleFuncion(id) {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const detailDiv = document.getElementById('detailDiv');
    
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        detailDiv.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/funciones/${id}`);
        if (!response.ok) {
            throw new Error('Error al cargar el detalle de la función');
        }
        const funcion = await response.json();
        
        loading.style.display = 'none';
        mostrarDetalle(funcion);
        detailDiv.style.display = 'block';
        
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
        
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

function mostrarDetalle(funcion) {
    const fecha = new Date(funcion.fechaHoraInicio);
    const fechaStr = fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const fin = new Date(funcion.fechaHoraFin);
    const finStr = fin.toLocaleString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('peliculaTitulo').textContent = `${funcion.peliculaTitulo} - ${funcion.formato.replace('_', 'D')}`;
    document.getElementById('cine').textContent = `${funcion.cineNombre} - Sala: ${funcion.salaNombre}`;
    document.getElementById('sala').textContent = `${funcion.salaNombre} (ID: ${funcion.salaId})`;
    document.getElementById('fechaHora').textContent = `${fechaStr} a ${finStr}`;
    document.getElementById('idioma').textContent = funcion.idioma;
    document.getElementById('precio').textContent = `$${funcion.precioBase.toLocaleString('es-AR')}`;
    document.getElementById('sinopsis').textContent = 'Consultá detalles completos desde el backend.';
    document.getElementById('duracion').textContent = '-';
    document.getElementById('genero').textContent = '-';
    document.getElementById('clasificacion').textContent = '-';
    document.getElementById('formatos').textContent = funcion.formato.replace('_', 'D');
    document.getElementById('btnComprar').href = `compra.html?id=${funcion.id}`;
}
