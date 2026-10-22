// Cartelera del landing: lista las películas activas y las filtra por cine y fecha.
// Los filtros se resuelven contra GET /api/funciones, así solo se muestran
// películas que realmente tienen una función en ese cine y/o esa fecha.

const CARTELERA = {
    peliculas: [],
    cines: []
};

document.addEventListener('DOMContentLoaded', inicializarCartelera);

async function inicializarCartelera() {
    const grid = document.getElementById('peliculasGrid');
    const loading = document.getElementById('peliculasLoading');
    const errorDiv = document.getElementById('peliculasError');
    const selectCine = document.getElementById('filtroCine');
    const selectFecha = document.getElementById('filtroFecha');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');

    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    grid.innerHTML = '';

    try {
        const [cines, funciones, peliculas] = await Promise.all([
            pedirJSON('/api/cines'),
            pedirJSON('/api/funciones'),
            pedirJSON('/api/peliculas')
        ]);

        CARTELERA.cines = cines.filter(cine => cine.activo !== false);
        CARTELERA.peliculas = peliculas.filter(pelicula => pelicula.activa !== false);

        cargarOpcionesCine(selectCine, CARTELERA.cines);
        cargarOpcionesFecha(selectFecha, funciones);

        loading.style.display = 'none';
        renderPeliculas(CARTELERA.peliculas);

        selectCine.addEventListener('change', aplicarFiltros);
        selectFecha.addEventListener('change', aplicarFiltros);
        btnLimpiar.addEventListener('click', limpiarFiltros);
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'No se pudo cargar la cartelera: ' + err.message;
    }
}

async function pedirJSON(path) {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) throw new Error(`la API respondió ${response.status} en ${path}`);
    return response.json();
}

function cargarOpcionesCine(select, cines) {
    cines
        .slice()
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
        .forEach(cine => {
            const option = document.createElement('option');
            option.value = cine.id;
            option.textContent = cine.ciudad ? `${cine.nombre} (${cine.ciudad})` : cine.nombre;
            select.appendChild(option);
        });
}

// El listado arranca en la fecha de hoy; después agrega los días que tienen funciones.
function cargarOpcionesFecha(select, funciones) {
    const hoy = hoyISO();
    const fechas = new Set([hoy]);

    funciones
        .filter(funcionVigente)
        .forEach(funcion => {
            const fecha = fechaDeFuncion(funcion);
            if (fecha && fecha >= hoy) fechas.add(fecha);
        });

    Array.from(fechas)
        .sort()
        .forEach(fecha => {
            const option = document.createElement('option');
            option.value = fecha;
            option.textContent = etiquetaFecha(fecha);
            select.appendChild(option);
        });
}

function funcionVigente(funcion) {
    if (funcion.estado === 'CANCELADA') return false;
    return new Date(funcion.fechaHoraInicio) >= new Date();
}

// Numero de la ultima consulta de filtros: si una respuesta llega tarde, se descarta.
let ultimaPeticion = 0;

async function aplicarFiltros() {
    const cineId = document.getElementById('filtroCine').value;
    const fecha = document.getElementById('filtroFecha').value;
    const loading = document.getElementById('peliculasLoading');
    const errorDiv = document.getElementById('peliculasError');
    const peticion = ++ultimaPeticion;

    if (!cineId && !fecha) {
        renderPeliculas(CARTELERA.peliculas);
        return;
    }

    const query = new URLSearchParams();
    if (cineId) query.set('cineId', cineId);
    if (fecha) query.set('fecha', fecha);

    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';

        const funciones = await pedirJSON(`/api/funciones?${query.toString()}`);
        if (peticion !== ultimaPeticion) return;

        const peliculaIds = new Set(funciones.filter(funcionVigente).map(funcion => funcion.peliculaId));

        loading.style.display = 'none';
        renderPeliculas(CARTELERA.peliculas.filter(pelicula => peliculaIds.has(pelicula.id)));
    } catch (err) {
        if (peticion !== ultimaPeticion) return;
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'No se pudieron aplicar los filtros: ' + err.message;
    }
}

function limpiarFiltros() {
    document.getElementById('filtroCine').value = '';
    document.getElementById('filtroFecha').value = '';
    aplicarFiltros();
}

function renderPeliculas(peliculas) {
    const grid = document.getElementById('peliculasGrid');
    const resultado = document.getElementById('carteleraResultado');
    const cineId = document.getElementById('filtroCine').value;
    const fecha = document.getElementById('filtroFecha').value;

    grid.innerHTML = '';

    if (!peliculas.length) {
        resultado.textContent = '';
        grid.innerHTML = `
            <div class="cartelera-vacio">
                <p>No hay películas que cumplan con los filtros seleccionados.</p>
                <button type="button" class="btn btn-secondary" id="btnVerTodas">Ver toda la cartelera</button>
            </div>
        `;
        document.getElementById('btnVerTodas').addEventListener('click', limpiarFiltros);
        return;
    }

    const filtros = [];
    if (cineId) {
        const cine = CARTELERA.cines.find(c => String(c.id) === String(cineId));
        if (cine) filtros.push(cine.nombre);
    }
    if (fecha) filtros.push(etiquetaFecha(fecha));

    const cantidad = `${peliculas.length} ${peliculas.length === 1 ? 'película' : 'películas'}`;
    resultado.textContent = filtros.length ? `${cantidad} · ${filtros.join(' · ')}` : cantidad;

    peliculas.forEach(pelicula => {
        const params = new URLSearchParams({ peliculaId: pelicula.id });
        if (cineId) params.set('cineId', cineId);
        if (fecha) params.set('fecha', fecha);

        const card = document.createElement('a');
        card.href = `pages/funciones.html?${params.toString()}`;
        card.className = 'poster-card';
        card.innerHTML = `
            <img src="${pelicula.urlPoster || 'https://via.placeholder.com/200x300/1a1a2e/ffffff?text=' + encodeURIComponent(pelicula.titulo)}"
                 alt="${pelicula.titulo}"
                 class="poster-img"
                 onerror="this.src='https://via.placeholder.com/200x300/1a1a2e/ffffff?text=CineClick'">
            <div class="poster-info">
                <div class="poster-title" title="${pelicula.titulo}">${pelicula.titulo}</div>
                <div class="poster-genre">${pelicula.genero} • ${pelicula.clasificacion}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}
