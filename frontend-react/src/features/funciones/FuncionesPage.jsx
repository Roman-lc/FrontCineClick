import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/http';
import { funcionVigente, fechaCorta, horaCorta, fechaHoraCorta, fechaDeFuncion, etiquetaFecha } from '../../lib/fechas';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';

function buildContextQuery(filtro, funcionId) {
  const params = new URLSearchParams({ id: funcionId });
  if (filtro.peliculaId) params.set('peliculaId', filtro.peliculaId);
  if (filtro.cineId) params.set('cineId', filtro.cineId);
  if (filtro.fecha) params.set('fecha', filtro.fecha);
  return params.toString();
}

export default function FuncionesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mostrarAviso, confirmar } = useToast();

  const peliculaId = searchParams.get('peliculaId') || '';
  const cineId = searchParams.get('cineId') || '';
  const fecha = searchParams.get('fecha') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [funciones, setFunciones] = useState([]);
  const [titulo, setTitulo] = useState('Funciones Disponibles');
  const [subtitulo, setSubtitulo] = useState('Seleccioná una función para ver el detalle o comprar tus entradas');
  const [nombrePelicula, setNombrePelicula] = useState(null);
  const [filtrosTexto, setFiltrosTexto] = useState('');
  const [mostrarBarraFiltros, setMostrarBarraFiltros] = useState(false);

  const filtros = { peliculaId, cineId, fecha };

  useEffect(() => {
    cargarFunciones();
  }, [peliculaId, cineId, fecha]);

  const cargarFunciones = async () => {
    setLoading(true);
    setError('');
    try {
      // link volver
      const queryVolver = new URLSearchParams();
      if (cineId) queryVolver.set('cineId', cineId);
      if (fecha) queryVolver.set('fecha', fecha);

      // titulo pelicula
      if (peliculaId) {
        try {
          const peli = await api.get(`/api/peliculas/${peliculaId}`);
          setNombrePelicula(peli.titulo);
          setTitulo(`Funciones - ${peli.titulo}`);
        } catch {}
      } else {
        setNombrePelicula(null);
        setTitulo('Funciones Disponibles');
      }

      // filtros texto
      const partes = [];
      if (cineId) {
        try {
          const cine = await api.get(`/api/cines/${cineId}`);
          if (cine.nombre) partes.push(cine.nombre);
        } catch {}
      }
      if (fecha) partes.push(etiquetaFecha(fecha));
      const ft = partes.join(' · ');
      setFiltrosTexto(ft);
      if (ft) {
        setSubtitulo(`Funciones${peliculaId && nombrePelicula ? ' de ' + nombrePelicula : peliculaId ? ' de ' + (nombrePelicula || '') : ''} · ${ft}`);
        setMostrarBarraFiltros(true);
      } else if (peliculaId && nombrePelicula) {
        setSubtitulo(`Seleccioná el horario para ${nombrePelicula}`);
        setMostrarBarraFiltros(false);
      } else if (peliculaId) {
        setSubtitulo(`Seleccioná el horario para la película`);
        setMostrarBarraFiltros(false);
      } else {
        setSubtitulo('Elegí una película para ver sus cines y horarios');
        setMostrarBarraFiltros(false);
      }

      const query = new URLSearchParams();
      if (peliculaId) query.set('peliculaId', peliculaId);
      if (cineId) query.set('cineId', cineId);
      if (fecha) query.set('fecha', fecha);

      const todas = await api.get('/api/funciones' + (query.toString() ? '?' + query.toString() : ''));
      const vigentes = (todas || []).filter(funcionVigente);
      setFunciones(vigentes);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const quitarFiltros = () => {
    const q = new URLSearchParams();
    if (peliculaId) q.set('peliculaId', peliculaId);
    navigate('/funciones' + (q.toString() ? '?' + q.toString() : ''));
  };

  const eliminarFuncion = async (id) => {
    if (!(await confirmar('¿Estás seguro de que deseas eliminar esta función?', { peligro: true, textoOk: 'Eliminar' }))) return;
    if (!user || user.rol !== 'ADMIN') {
      mostrarAviso('No tienes permisos para realizar esta acción', 'error');
      return;
    }
    try {
      await api.delete(`/api/funciones/${id}`);
      mostrarAviso('Función eliminada correctamente', 'exito');
      cargarFunciones();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  };

  const volverHref = () => {
    const queryVolver = new URLSearchParams();
    if (cineId) queryVolver.set('cineId', cineId);
    if (fecha) queryVolver.set('fecha', fecha);
    return '/' + (queryVolver.toString() ? '?' + queryVolver.toString() : '');
  };

  const isAdmin = user && user.rol === 'ADMIN';
  const conFiltros = !!(cineId || fecha);

  // Agrupar por película
  if (!peliculaId && !loading && !error) {
    const porPelicula = new Map();
    funciones.forEach((f) => {
      if (!porPelicula.has(f.peliculaId)) {
        porPelicula.set(f.peliculaId, { id: f.peliculaId, titulo: f.peliculaTitulo || 'Película', funciones: [] });
      }
      porPelicula.get(f.peliculaId).funciones.push(f);
    });
    const peliculasAgrupadas = Array.from(porPelicula.values()).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    peliculasAgrupadas.forEach((p) => p.funciones.sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)));
    return (
      <section className="section">
        <Link to={volverHref()} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver a Cartelera</Link>
        <h2>{titulo}</h2>
        <p id="subtituloFunciones" style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>{subtitulo}</p>
        {loading && <div className="loading">Cargando funciones...</div>}
        {error && <div className="error">{error}</div>}
        {mostrarBarraFiltros && (
          <div className="filtros-activos" style={{ display: 'flex' }}>
            <span>Filtrando por: {filtrosTexto}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={quitarFiltros}>Ver todas las funciones</button>
          </div>
        )}
        {!loading && !error && funciones.length === 0 && (
          <div className="no-results">
            <p>{conFiltros ? 'No hay funciones con esos filtros' : 'No hay funciones disponibles por el momento'}</p>
            {conFiltros && <Link to={volverHref()} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Volver a la cartelera</Link>}
          </div>
        )}
        {!loading && !error && peliculasAgrupadas.map((pelicula) => {
          const porCine = new Map();
          pelicula.funciones.forEach((f) => {
            if (!porCine.has(f.cineId)) porCine.set(f.cineId, { nombre: f.cineNombre || 'Cine', funciones: [] });
            porCine.get(f.cineId).funciones.push(f);
          });
          const queryTodos = new URLSearchParams({ peliculaId: String(pelicula.id) });
          if (cineId) queryTodos.set('cineId', cineId);
          if (fecha) queryTodos.set('fecha', fecha);
          return (
            <div key={pelicula.id} className="pelicula-group">
              <div className="pelicula-group-header">
                <h3>{pelicula.titulo}</h3>
                <Link to={`/funciones?${queryTodos.toString()}`} className="btn btn-secondary btn-sm">Ver todos los horarios</Link>
              </div>
              <div className="pelicula-cines">
                {Array.from(porCine.values()).map((cine, idx) => (
                  <div key={idx} className="pelicula-cine">
                    <div className="pelicula-cine-nombre">🎬 {cine.nombre}</div>
                    <div className="chips">
                      {cine.funciones.map((f) => (
                        <Link key={f.id} to={`/detalle?${buildContextQuery(filtros, f.id)}`} className="chip chip-horario" title={`${f.salaNombre || ''} - ${fechaCorta(fechaDeFuncion(f))} · ${horaCorta(f.fechaHoraInicio)}`}>
                          {fechaCorta(fechaDeFuncion(f))} · {horaCorta(f.fechaHoraInicio)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  // Por película
  const funcionesPorCine = {};
  funciones.forEach((f) => {
    const key = f.cineId + '|' + (f.cineNombre || '');
    if (!funcionesPorCine[key]) funcionesPorCine[key] = { id: f.cineId, nombre: f.cineNombre, funciones: [] };
    funcionesPorCine[key].funciones.push(f);
  });
  Object.values(funcionesPorCine).forEach((cine) => cine.funciones.sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)));

  return (
    <section className="section">
      <Link to={volverHref()} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Volver a Cartelera</Link>
      <h2>{titulo}</h2>
      <p id="subtituloFunciones" style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>{subtitulo}</p>
      {loading && <div className="loading">Cargando funciones...</div>}
      {error && <div className="error">{error}</div>}
      {mostrarBarraFiltros && (
        <div className="filtros-activos" style={{ display: 'flex' }}>
          <span>Filtrando por: {filtrosTexto}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={quitarFiltros}>Ver todas las funciones</button>
        </div>
      )}
      {!loading && !error && funciones.length === 0 && (
        <div className="no-results">
          <p>{conFiltros ? 'No hay funciones con esos filtros' : 'No hay funciones disponibles para esta película'}</p>
          {conFiltros && <Link to={volverHref()} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Volver a la cartelera</Link>}
        </div>
      )}
      {!loading && !error && Object.values(funcionesPorCine).map((cine, idx) => (
        <div key={idx} className="cine-group">
          <div className="cine-header" onClick={() => {
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
          }}>
            <h3>🎬 {cine.nombre || 'Cine sin nombre'}</h3>
            <span className="cine-toggle" id={`toggle-${idx}`}>-</span>
          </div>
          <div className="cine-content" id={`content-${idx}`}>
            {cine.funciones.map((f) => (
              <div key={f.id} className="card" style={{ margin: 0 }}>
                <div className="card-header">
                  <strong>Sala: {f.salaNombre || ''}</strong>
                  <span className="badge">{String(f.formato || '').replace('_', 'D')}</span>
                </div>
                <div className="card-body">
                  <p><strong>📅 Fecha/Hora:</strong> {fechaHoraCorta(f.fechaHoraInicio)}</p>
                  <p><strong>🌐 Idioma:</strong> {f.idioma || ''}</p>
                  <p><strong>💰 Precio:</strong> ${(f.precioBase || 0).toLocaleString('es-AR')}</p>
                  <div className="card-actions">
                    <Link to={`/detalle?${buildContextQuery(filtros, f.id)}`} className="btn btn-info">Detalle</Link>
                    <Link to={`/compra?${buildContextQuery(filtros, f.id)}`} className="btn btn-success">Comprar</Link>
                    {isAdmin && <Link to={`/admin/editar-funcion?id=${f.id}`} className="btn btn-warning">Modificar</Link>}
                    {isAdmin && <button onClick={() => eliminarFuncion(f.id)} className="btn btn-danger">Borrar</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
