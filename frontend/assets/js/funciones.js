document.addEventListener('DOMContentLoaded', () => {
    cargarFunciones();
});

async function cargarFunciones() {
    const funcionesList = document.getElementById('funcionesList');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const titulo = document.getElementById('tituloFunciones');
    const subtitulo = document.getElementById('subtituloFunciones');
    
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        funcionesList.innerHTML = '';
        
        const params = new URLSearchParams(window.location.search);
        const peliculaId = params.get('peliculaId');
        const cineId = params.get('cineId');
        const fecha = params.get('fecha');

        // El botón de volver conserva los filtros con los que se llegó
        const volver = document.getElementById('volverCartelera');
        if (volver) {
            const queryVolver = new URLSearchParams();
            if (cineId) queryVolver.set('cineId', cineId);
            if (fecha) queryVolver.set('fecha', fecha);
            volver.href = '../index.html' + (queryVolver.toString() ? '?' + queryVolver.toString() : '');
        }

        const query = new URLSearchParams();
        if (peliculaId) query.set('peliculaId', peliculaId);
        if (cineId) query.set('cineId', cineId);
        if (fecha) query.set('fecha', fecha);

        const url = `${API_BASE_URL}/api/funciones${query.toString() ? '?' + query.toString() : ''}`;

        let nombrePelicula = null;
        if (peliculaId) {
            // Intentar obtener info de la película
            try {
                const respPeli = await fetch(`${API_BASE_URL}/api/peliculas/${peliculaId}`);
                if (respPeli.ok) {
                    const peli = await respPeli.json();
                    nombrePelicula = peli.titulo;
                    if (titulo) titulo.textContent = `Funciones - ${peli.titulo}`;
                }
            } catch(e) {}
        }

        // Filtros elegidos en la cartelera del landing
        const filtrosTexto = await describirFiltros(cineId, fecha);
        if (subtitulo) {
            if (filtrosTexto) {
                subtitulo.textContent = `Funciones${nombrePelicula ? ' de ' + nombrePelicula : ''} · ${filtrosTexto}`;
            } else if (nombrePelicula) {
                subtitulo.textContent = `Seleccioná el horario para ${nombrePelicula}`;
            }
        }
        mostrarFiltrosActivos(cineId, fecha, filtrosTexto);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar funciones');
        }
        const todasLasFunciones = await response.json();

        // El backend devuelve también las canceladas y las que ya pasaron.
        const funciones = todasLasFunciones.filter(funcionVigente);

        loading.style.display = 'none';
        
        if (funciones.length === 0) {
            const conFiltros = cineId || fecha;
            funcionesList.innerHTML = conFiltros
                ? `<div class="no-results"><p>No hay funciones con esos filtros</p><a href="${volver ? volver.getAttribute('href') : '../index.html'}" class="btn btn-secondary" style="margin-top: 1rem;">Volver a la cartelera</a></div>`
                : '<div class="no-results"><p>No hay funciones disponibles para esta película</p></div>';
            return;
        }
        
        // Agrupar por cine
        const funcionesPorCine = {};
        funciones.forEach(funcion => {
            const cineKey = funcion.cineId + '|' + (funcion.cineNombre || '');
            if (!funcionesPorCine[cineKey]) {
                funcionesPorCine[cineKey] = {
                    id: funcion.cineId,
                    nombre: funcion.cineNombre,
                    funciones: []
                };
            }
            funcionesPorCine[cineKey].funciones.push(funcion);
        });
        
        // Ordenar cines por nombre y funciones por fecha
        Object.values(funcionesPorCine).forEach(cine => {
            cine.funciones.sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio));
        });
        
        // Mostrar agrupado
        funcionesList.innerHTML = '';
        Object.values(funcionesPorCine).forEach((cine, idx) => {
            const cineDiv = document.createElement('div');
            cineDiv.className = 'cine-group';
            cineDiv.innerHTML = `
                <div class="cine-header" onclick="window.toggleCine(${idx})">
                    <h3>🎬 ${escapeHtml(cine.nombre || 'Cine sin nombre')}</h3>
                    <span class="cine-toggle" id="toggle-${idx}">-</span>
                </div>
                <div class="cine-content" id="content-${idx}">
                    ${cine.funciones.map(f => {
                        const fecha = new Date(f.fechaHoraInicio);
                        const fechaStr = fechaHoraCorta(f.fechaHoraInicio);
                        const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
                        const isAdmin = user && user.rol === 'ADMIN';
                        return `
                            <div class="card" style="margin:0;">
                                <div class="card-header">
                                    <strong>Sala: ${escapeHtml(f.salaNombre || '')}</strong>
                                    <span class="badge">${escapeHtml((f.formato || '').toString().replace('_', 'D'))}</span>
                                </div>
                                <div class="card-body">
                                    <p><strong>📅 Fecha/Hora:</strong> ${fechaStr}</p>
                                    <p><strong>🌐 Idioma:</strong> ${escapeHtml(f.idioma || '')}</p>
                                    <p><strong>💰 Precio:</strong> $${(f.precioBase || 0).toLocaleString('es-AR')}</p>
                                    <div class="card-actions">
                                        <a href="detalle.html?id=${f.id}" class="btn btn-info">Detalle</a>
                                        <a href="compra.html?id=${f.id}" class="btn btn-success">Comprar</a>
                                        ${isAdmin ? `<a href="admin-edit.html?id=${f.id}" class="btn btn-warning">Modificar</a><button onclick="eliminarFuncion(${f.id})" class="btn btn-danger">Borrar</button>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            funcionesList.appendChild(cineDiv);
        });
        
        // Actualizar navbar por si hay cambios de auth
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
        
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

function crearCardFuncion(funcion) {
    const div = document.createElement('div');
    div.className = 'card';
    
    const fecha = new Date(funcion.fechaHoraInicio);
    const fechaStr = fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    const isAdmin = user && user.rol === 'ADMIN';
    
    div.innerHTML = `
        <div class="card-header">
            <strong>${escapeHtml(funcion.peliculaTitulo || '')}</strong>
            <span class="badge">${escapeHtml((funcion.formato || '').toString().replace('_', 'D'))}</span>
        </div>
        <div class="card-body">
            <p><strong>🎬 Cine:</strong> ${escapeHtml(funcion.cineNombre || '')}</p>
            <p><strong>🏛️ Sala:</strong> ${escapeHtml(funcion.salaNombre || '')}</p>
            <p><strong>📅 Fecha/Hora:</strong> ${fechaStr}</p>
            <p><strong>🌐 Idioma:</strong> ${escapeHtml(funcion.idioma || '')}</p>
            <p><strong>💰 Precio:</strong> $${(funcion.precioBase || 0).toLocaleString('es-AR')}</p>
            <div class="card-actions">
                <a href="detalle.html?id=${funcion.id}" class="btn btn-info">Ver Detalle</a>
                <a href="compra.html?id=${funcion.id}" class="btn btn-success">Comprar</a>
                ${isAdmin ? `
                    <a href="admin-edit.html?id=${funcion.id}" class="btn btn-warning">Modificar</a>
                    <button onclick="eliminarFuncion(${funcion.id})" class="btn btn-danger">Borrar</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return div;
}

window.toggleCine = function(idx) {
    const content = document.getElementById(`content-${idx}`);
    const toggle = document.getElementById(`toggle-${idx}`);
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggle.classList.add('open');
        toggle.textContent = '-';
    } else {
        content.classList.add('hidden');
        toggle.classList.remove('open');
        toggle.textContent = '+';
    }
}

async function eliminarFuncion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta función?')) {
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (!user || user.rol !== 'ADMIN') {
        alert('No tienes permisos para realizar esta acción');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/funciones/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Función eliminada correctamente');
            cargarFunciones();
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error al eliminar función');
        }
    } catch (err) {
        alert('Error de conexión: ' + err.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Barra que avisa qué filtros están puestos y permite sacarlos, conservando la película.
function mostrarFiltrosActivos(cineId, fecha, filtrosTexto) {
    const contenedor = document.getElementById('filtrosActivos');
    const texto = document.getElementById('filtrosActivosTexto');
    const btnQuitar = document.getElementById('btnQuitarFiltros');
    if (!contenedor || !texto || !btnQuitar) return;

    if (!filtrosTexto) {
        contenedor.style.display = 'none';
        return;
    }

    texto.textContent = `Filtrando por: ${filtrosTexto}`;
    contenedor.style.display = 'flex';

    btnQuitar.onclick = () => {
        const params = new URLSearchParams(window.location.search);
        const query = new URLSearchParams();
        const peliculaId = params.get('peliculaId');
        if (peliculaId) query.set('peliculaId', peliculaId);

        contenedor.style.display = 'none';
        window.history.replaceState({}, '', query.toString() ? `?${query.toString()}` : window.location.pathname);
        cargarFunciones();
    };
}

// Arma el texto de los filtros que llegan desde la cartelera ("CineClick Abasto · Hoy · 22/10")
async function describirFiltros(cineId, fecha) {
    const partes = [];

    if (cineId) {
        try {
            const resp = await fetch(`${API_BASE_URL}/api/cines/${cineId}`);
            if (resp.ok) {
                const cine = await resp.json();
                if (cine.nombre) partes.push(cine.nombre);
            }
        } catch (e) {}
    }

    if (fecha) partes.push(etiquetaFecha(fecha));

    return partes.join(' · ');
}
