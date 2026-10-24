import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { hoyISO, sumarDiasISO, diaSemanaCorto, fechaCorta, etiquetaFecha } from '../../lib/fechas';

const DIAS_EN_TIRA = 7;

function funcionVigenteLocal(funcion) {
  if (funcion.estado === 'CANCELADA') return false;
  return new Date(funcion.fechaHoraInicio) >= new Date();
}

function fechaDeFuncion(funcion) {
  if (!funcion || !funcion.fechaHoraInicio) return '';
  return funcion.fechaHoraInicio.split('T')[0];
}

function urlPosterPorDefecto(texto) {
  return 'https://via.placeholder.com/200x300/1a1a2e/ffffff?text=' + encodeURIComponent(texto || 'CineClick');
}

export default function HomePage() {
  const [cines, setCines] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [peliculasEnCartel, setPeliculasEnCartel] = useState([]);
  const [fechasConFunciones, setFechasConFunciones] = useState(new Set());
  const [cineId, setCineId] = useState('');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultadoTexto, setResultadoTexto] = useState('');
  const [peliculasMostradas, setPeliculasMostradas] = useState([]);
  const [aplicandoFiltros, setAplicandoFiltros] = useState(false);
  const peticionRef = useRef(0);
  const [bannerIndex, setBannerIndex] = useState(0);
  const banners = [
    {
      img: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      titulo: 'Interestelar',
      desc: 'Una aventura épica más allá de las estrellas'
    },
    {
      img: 'https://image.tmdb.org/t/p/original/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      titulo: 'Intensamente 2',
      desc: 'Nuevas emociones llegan al centro de control'
    }
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cId = params.get('cineId') || '';
    const fId = params.get('fecha') || '';
    setCineId(cId);
    setFecha(fId);
    inicializar(cId, fId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const inicializar = async (cIdInicial, fIdInicial) => {
    setLoading(true);
    setError('');
    try {
      const [cinesRes, funcionesRes, peliculasRes] = await Promise.all([
        api.get('/api/cines'),
        api.get('/api/funciones'),
        api.get('/api/peliculas'),
      ]);

      const vigentes = funcionesRes.filter(funcionVigenteLocal);
      const idsConFuncion = new Set(vigentes.map((f) => f.peliculaId));

      let cinesFiltrados = (cinesRes || [])
        .filter((cine) => cine.activo !== false)
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
      setCines(cinesFiltrados);

      let peliculasFiltradas = (peliculasRes || []).filter((p) => p.activa !== false);
      setPeliculas(peliculasFiltradas);

      let enCartel = peliculasFiltradas.filter((p) => idsConFuncion.has(p.id));
      setPeliculasEnCartel(enCartel);
      setFechasConFunciones(new Set(vigentes.map(fechaDeFuncion)));

      let cineValido = cIdInicial;
      let fechaValida = fIdInicial;
      if (cineValido && !cinesFiltrados.some((cine) => String(cine.id) === cineValido)) {
        cineValido = '';
        setCineId('');
      }
      const hoy = hoyISO();
      const ultimoDia = sumarDiasISO(hoy, DIAS_EN_TIRA - 1);
      if (fechaValida && (fechaValida < hoy || fechaValida > ultimoDia)) {
        fechaValida = '';
        setFecha('');
      }

      setLoading(false);
      await aplicarFiltros(cineValido, fechaValida, peliculasFiltradas, enCartel);
    } catch (err) {
      setLoading(false);
      setError('No se pudo cargar la cartelera: ' + err.message);
    }
  };

  const aplicarFiltros = async (cId, fId, pelis = peliculas, enCart = peliculasEnCartel) => {
    const peticion = ++peticionRef.current;
    if (!cId && !fId) {
      setPeliculasMostradas(enCart);
      setResultadoTexto(enCart.length ? `${enCart.length} ${enCart.length === 1 ? 'película' : 'películas'}` : '');
      return;
    }
    const query = new URLSearchParams();
    if (cId) query.set('cineId', cId);
    if (fId) query.set('fecha', fId);
    try {
      setAplicandoFiltros(true);
      const funciones = await api.get('/api/funciones' + (query.toString() ? '?' + query.toString() : ''));
      if (peticion !== peticionRef.current) return;
      const peliculaIds = new Set((funciones || []).filter(funcionVigenteLocal).map((f) => f.peliculaId));
      const filtradas = (pelis.length ? pelis : peliculas).filter((p) => peliculaIds.has(p.id));
      setAplicandoFiltros(false);
      setPeliculasMostradas(filtradas);
      setResultadoTexto(filtradas.length ? `${filtradas.length} ${filtradas.length === 1 ? 'película' : 'películas'}` : '');
    } catch (err) {
      if (peticion !== peticionRef.current) return;
      setAplicandoFiltros(false);
      setError('No se pudieron aplicar los filtros: ' + err.message);
    }
  };

  const seleccionarCine = (valor) => {
    setCineId(valor);
    aplicarFiltros(valor, fecha);
  };

  const seleccionarFecha = (valor) => {
    setFecha(valor);
    aplicarFiltros(cineId, valor);
  };

  const limpiarFiltros = () => {
    setCineId('');
    setFecha('');
    aplicarFiltros('', '');
  };

  const hoy = hoyISO();
  const hayFunciones = peliculasEnCartel.length > 0;
  const todasMostradas = !cineId && !fecha ? peliculasEnCartel : peliculasMostradas;

  const buildLink = (peliculaId) => {
    const params = new URLSearchParams({ peliculaId: String(peliculaId) });
    if (cineId) params.set('cineId', cineId);
    if (fecha) params.set('fecha', fecha);
    return `/funciones?${params.toString()}`;
  };

  return (
    <>
      <section className="section" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="banner-container" id="bannerContainer">
          {banners.map((banner, idx) => (
            <div key={idx} className={`banner-slide ${idx === bannerIndex ? 'active' : ''}`}>
              <img src={banner.img} alt={`Banner ${idx + 1}`} />
              <div className="banner-content">
                <h2>{banner.titulo}</h2>
                <p>{banner.desc}</p>
              </div>
            </div>
          ))}
          <button className="banner-nav banner-prev" onClick={() => setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}>❮</button>
          <button className="banner-nav banner-next" onClick={() => setBannerIndex((prev) => (prev + 1) % banners.length)}>❯</button>
          <div className="banner-dots" id="bannerDots">
            {banners.map((_, idx) => (
              <button key={idx} className={`banner-dot ${idx === bannerIndex ? 'active' : ''}`} onClick={() => setBannerIndex(idx)} aria-label={`Ir al banner ${idx + 1}`}></button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Cartelera</h2>

        <div className="cartelera-filtros">
          <div className="filtro-grupo" role="group" aria-labelledby="labelFiltroCine">
            <div className="filtro-grupo-label" id="labelFiltroCine">Cine</div>
            <div className="chips" id="filtroCines" style={{overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch"}}>
              <button type="button" className={`chip ${cineId === '' ? 'active' : ''}`} aria-pressed={cineId === ''} onClick={() => seleccionarCine('')}>
                <span className="chip-titulo">Todos</span>
                <span className="chip-sub">cines</span>
              </button>
              {cines.map((cine) => (
                <button key={cine.id} type="button" className={`chip ${cineId === String(cine.id) ? 'active' : ''}`} aria-pressed={cineId === String(cine.id)} onClick={() => seleccionarCine(String(cine.id))}>
                  <span className="chip-titulo">{cine.nombre}</span>
                  {cine.ciudad && <span className="chip-sub">{cine.ciudad}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="filtro-grupo" role="group" aria-labelledby="labelFiltroFecha">
            <div className="filtro-grupo-label" id="labelFiltroFecha">Fecha</div>
            <div className="chips" id="filtroFechas" style={{overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch"}}>
              <button type="button" className={`chip ${fecha === '' ? 'active' : ''}`} aria-pressed={fecha === ''} onClick={() => seleccionarFecha('')}>
                <span className="chip-titulo">Todas</span>
                <span className="chip-sub">fechas</span>
              </button>
              {[...Array(DIAS_EN_TIRA)].map((_, i) => {
                const f = sumarDiasISO(hoy, i);
                const titulo = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : diaSemanaCorto(f);
                const sinFunciones = !fechasConFunciones.has(f);
                return (
                  <button
                    key={f}
                    type="button"
                    className={`chip ${fecha === f ? 'active' : ''} ${sinFunciones ? 'sin-funciones' : ''}`}
                    aria-pressed={fecha === f}
                    disabled={sinFunciones}
                    title={sinFunciones ? 'Sin funciones para este día' : ''}
                    onClick={() => !sinFunciones && seleccionarFecha(f)}
                  >
                    <span className="chip-titulo">{titulo}</span>
                    <span className="chip-sub">{fechaCorta(f)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p id="carteleraResultado" className="cartelera-resultado" aria-live="polite">{resultadoTexto}</p>

        {loading && <div id="peliculasLoading" className="loading">Cargando películas...</div>}
        {error && <div id="peliculasError" className="error">{error}</div>}

        <div id="peliculasGrid" className="poster-grid">
          {(loading || aplicandoFiltros) ? null : (
            todasMostradas.length === 0 ? (
              <div className="cartelera-vacio">
                {peliculas.length === 0 ? (
                  <p>No hay películas disponibles.</p>
                ) : (
                  <>
                    <p>{hayFunciones ? 'No hay películas con funciones para los filtros elegidos.' : 'No hay funciones programadas por el momento.'}</p>
                    {hayFunciones && <button type="button" className="btn btn-secondary" onClick={limpiarFiltros}>Ver toda la cartelera</button>}
                  </>
                )}
              </div>
            ) : (
              todasMostradas.map((pelicula) => {
                const titulo = pelicula.titulo || '';
                return (
                  <Link key={pelicula.id} to={buildLink(pelicula.id)} className="poster-card">
                    <img
                      src={pelicula.urlPoster || urlPosterPorDefecto(titulo)}
                      alt={titulo}
                      className="poster-img"
                      onError={(e) => { e.currentTarget.src = urlPosterPorDefecto('CineClick'); }}
                    />
                    <div className="poster-info">
                      <div className="poster-title" title={titulo}>{titulo}</div>
                      <div className="poster-genre">{pelicula.genero} • {pelicula.clasificacion}</div>
                    </div>
                  </Link>
                );
              })
            )
          )}
        </div>
      </section>

      <section className="section">
        <h2>¿Cómo comprar?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Elegí tu película</h3>
            <p>Seleccioná la película de tu interés desde la cartelera</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Seleccioná función y butacas</h3>
            <p>Elegí horario, cine, sala y tus asientos preferidos</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Pagá y confirmá</h3>
            <p>Completá tus datos, aplicá promoción y finalizá la compra</p>
          </div>
        </div>
      </section>
    </>
  );
}
