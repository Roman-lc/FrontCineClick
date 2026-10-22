// Cartelera del landing: lista las películas activas y las filtra por cine y fecha.
// Los filtros se resuelven contra GET /api/funciones, así solo se muestran
// películas que realmente tienen una función en ese cine y/o esa fecha.

const CARTELERA = {
    peliculas: [],
    cines: [],
    peliculasEnCartel: [],
    fechasConFunciones: new Set(),
    cineId: '',
    fecha: ''
};

const DIAS_EN_TIRA = 7;

document.addEventListener('DOMContentLoaded', inicializarCartelera);

async function inicializarCartelera() {
    const grid = document.getElementById('peliculasGrid');
    const loading = document.getElementById('peliculasLoading');
    const errorDiv = document.getElementById('peliculasError');

    // Filtros que pueden venir de la página de funciones (?cineId=..&fecha=..)
    const params = new URLSearchParams(window.location.search);
    CARTELERA.cineId = params.get('cineId') || '';
    CARTELERA.fecha = params.get('fecha') || '';

    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    grid.innerHTML = '';

    try {
        const [cines, funciones, peliculas] = await Promise.all([
            pedirJSON('/api/cines'),
            pedirJSON('/api/funciones'),
            pedirJSON('/api/peliculas')
        ]);

        const vigentes = funciones.filter(funcionVigente);
        const idsConFuncion = new Set(vigentes.map(funcion => funcion.peliculaId));

        CARTELERA.cines = cines
            .filter(cine => cine.activo !== false)
            .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
        CARTELERA.peliculas = peliculas.filter(pelicula => pelicula.activa !== false);
        // Solo las que tienen alguna función vigente: sin eso no hay nada que comprar.
        CARTELERA.peliculasEnCartel = CARTELERA.peliculas.filter(pelicula => idsConFuncion.has(pelicula.id));
        CARTELERA.fechasConFunciones = new Set(vigentes.map(fechaDeFuncion));

        // Un filtro que ya no existe (cine borrado, fecha fuera de la tira) se descarta
        if (CARTELERA.cineId && !CARTELERA.cines.some(cine => String(cine.id) === CARTELERA.cineId)) {
            CARTELERA.cineId = '';
        }
        const hoy = hoyISO();
        const ultimoDia = sumarDiasISO(hoy, DIAS_EN_TIRA - 1);
        if (CARTELERA.fecha && (CARTELERA.fecha < hoy || CARTELERA.fecha > ultimoDia)) {
            CARTELERA.fecha = '';
        }

        renderTiraCines();
        renderTiraFechas();
        avisarCambioDeFiltros();

        // Delegación: un solo listener por tira
        document.getElementById('filtroCines').addEventListener('click', event => {
            const chip = event.target.closest('.chip');
            if (!chip) return;
            CARTELERA.cineId = chip.dataset.valor;
            renderTiraCines();
            aplicarFiltros();
            avisarCambioDeFiltros();
        });

        document.getElementById('filtroFechas').addEventListener('click', event => {
            const chip = event.target.closest('.chip');
            if (!chip) return;
            CARTELERA.fecha = chip.dataset.valor;
            renderTiraFechas();
            aplicarFiltros();
            avisarCambioDeFiltros();
        });

        loading.style.display = 'none';
        aplicarFiltros();
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

function funcionVigente(funcion) {
    if (funcion.estado === 'CANCELADA') return false;
    return new Date(funcion.fechaHoraInicio) >= new Date();
}

// ---------- Tiras de filtros ----------

function crearChip(valor, titulo, subtitulo, activo, opciones) {
    const { claseExtra = '', deshabilitado = false, title = '' } = opciones || {};

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (activo ? ' active' : '') + (claseExtra ? ' ' + claseExtra : '');
    chip.dataset.valor = valor;
    chip.disabled = deshabilitado;
    chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
    // El texto del chip está partido en dos spans, así que el nombre accesible
    // se arma a mano ("Hoy 22/10" en vez de "Hoy22/10").
    chip.setAttribute('aria-label', subtitulo ? `${titulo} ${subtitulo}` : titulo);
    if (title) chip.title = title;

    const tituloEl = document.createElement('span');
    tituloEl.className = 'chip-titulo';
    tituloEl.textContent = titulo;
    tituloEl.setAttribute('aria-hidden', 'true');
    chip.appendChild(tituloEl);

    if (subtitulo) {
        const subEl = document.createElement('span');
        subEl.className = 'chip-sub';
        subEl.textContent = subtitulo;
        subEl.setAttribute('aria-hidden', 'true');
        chip.appendChild(subEl);
    }

    return chip;
}

function renderTiraCines() {
    const contenedor = document.getElementById('filtroCines');
    contenedor.innerHTML = '';
    contenedor.appendChild(crearChip('', 'Todos', 'cines', CARTELERA.cineId === ''));

    CARTELERA.cines.forEach(cine => {
        const valor = String(cine.id);
        contenedor.appendChild(crearChip(valor, cine.nombre, cine.ciudad || '', CARTELERA.cineId === valor));
    });
}

// Tira fija: hoy + los próximos 6 días. Los días sin funciones quedan
// atenuados y deshabilitados, así nunca se cae en una cartelera vacía.
function renderTiraFechas() {
    const contenedor = document.getElementById('filtroFechas');
    contenedor.innerHTML = '';
    contenedor.appendChild(crearChip('', 'Todas', 'fechas', CARTELERA.fecha === ''));

    const hoy = hoyISO();
    for (let i = 0; i < DIAS_EN_TIRA; i++) {
        const fecha = sumarDiasISO(hoy, i);
        const titulo = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : diaSemanaCorto(fecha);
        const sinFunciones = !CARTELERA.fechasConFunciones.has(fecha);

        const chip = crearChip(fecha, titulo, fechaCorta(fecha), CARTELERA.fecha === fecha, {
            claseExtra: sinFunciones ? 'sin-funciones' : '',
            deshabilitado: sinFunciones,
            title: sinFunciones ? 'Sin funciones para este día' : ''
        });
        contenedor.appendChild(chip);
    }
}

// ---------- Filtrado ----------

// Numero de la ultima consulta de filtros: si una respuesta llega tarde, se descarta.
let ultimaPeticion = 0;

async function aplicarFiltros() {
    const { cineId, fecha } = CARTELERA;
    const loading = document.getElementById('peliculasLoading');
    const errorDiv = document.getElementById('peliculasError');
    const peticion = ++ultimaPeticion;

    if (!cineId && !fecha) {
        renderPeliculas(CARTELERA.peliculasEnCartel);
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

// Params que viajan a funciones.html: la película y los filtros activos.
function parametrosFiltros(peliculaId) {
    const params = new URLSearchParams({ peliculaId });
    if (CARTELERA.cineId) params.set('cineId', CARTELERA.cineId);
    if (CARTELERA.fecha) params.set('fecha', CARTELERA.fecha);
    return params;
}

// Mismo camino de vuelta: ../index.html?cineId=..&fecha=..
function urlVolverACartelera() {
    const params = new URLSearchParams();
    if (CARTELERA.cineId) params.set('cineId', CARTELERA.cineId);
    if (CARTELERA.fecha) params.set('fecha', CARTELERA.fecha);
    return '../index.html' + (params.toString() ? '?' + params.toString() : '');
}

function limpiarFiltros() {
    CARTELERA.cineId = '';
    CARTELERA.fecha = '';
    renderTiraCines();
    renderTiraFechas();
    aplicarFiltros();
    avisarCambioDeFiltros();
}

// Zona de resultados: se avisa a lectores de pantalla qué quedó listado.
function avisarCambioDeFiltros() {
    const resultado = document.getElementById('carteleraResultado');
    if (resultado) resultado.setAttribute('aria-live', 'polite');
}

function renderPeliculas(peliculas) {
    const grid = document.getElementById('peliculasGrid');
    const resultado = document.getElementById('carteleraResultado');
    const { cineId, fecha } = CARTELERA;

    grid.innerHTML = '';

    if (!peliculas.length) {
        resultado.textContent = '';
        if (CARTELERA.peliculas.length === 0) {
            grid.innerHTML = '<div class="cartelera-vacio"><p>No hay películas disponibles.</p></div>';
            return;
        }

        const hayFunciones = CARTELERA.peliculasEnCartel.length > 0;
        grid.innerHTML = `
            <div class="cartelera-vacio">
                <p>${hayFunciones
                    ? 'No hay películas con funciones para los filtros elegidos.'
                    : 'No hay funciones programadas por el momento.'}</p>
                ${hayFunciones ? '<button type="button" class="btn btn-secondary" id="btnVerTodas">Ver toda la cartelera</button>' : ''}
            </div>
        `;

        const btnVerTodas = document.getElementById('btnVerTodas');
        if (btnVerTodas) btnVerTodas.addEventListener('click', limpiarFiltros);
        return;
    }

    resultado.textContent = `${peliculas.length} ${peliculas.length === 1 ? 'película' : 'películas'}`;

    peliculas.forEach(pelicula => {
        const card = document.createElement('a');
        card.href = `pages/funciones.html?${parametrosFiltros(pelicula.id).toString()}`;
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
