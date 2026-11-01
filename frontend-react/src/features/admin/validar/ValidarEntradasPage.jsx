import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListado } from '../../../components/admin/useListado';
import admin from '../../../components/admin/admin.module.css';
import EstadoError from '../../../components/ui/EstadoError';
import EstadoVacio from '../../../components/ui/EstadoVacio';
import { EsqueletoFilas } from '../../../components/ui/Esqueletos';
import { fechaDeFuncion, fechaFuncionCorta, horaCorta, hoyISO } from '../../../lib/fechas';
import { nombreCine } from '../../../lib/formato';
import { adminCines, adminFunciones, validarEntrada } from '../../../services/admin';
import EscanerQr from './EscanerQr';
import styles from './validar.module.css';

const RESULTADOS = {
  VALIDA: { titulo: 'Entrada válida', icono: 'ok', clase: 'valida' },
  YA_USADA: { titulo: 'Esta entrada ya se usó', icono: 'error', clase: 'rechazada' },
  OTRA_FUNCION: { titulo: 'Es para otra función', icono: 'error', clase: 'rechazada' },
  NO_CONFIRMADA: { titulo: 'La compra no está pagada', icono: 'error', clase: 'rechazada' },
  NO_EXISTE: { titulo: 'No existe una entrada con ese código', icono: 'error', clase: 'rechazada' },
  ERROR: { titulo: 'No se pudo validar', icono: 'error', clase: 'rechazada' },
};

// BarcodeDetector: Chrome y Edge en Android, ChromeOS y macOS. Sin el, se valida escribiendo el codigo.
const hayEscaner = typeof window !== 'undefined' && 'BarcodeDetector' in window;

const cargar = () => Promise.all([adminFunciones.listar(), adminCines.listar()]).then(([funciones, cines]) => ({ funciones, cines }));

// Funciones que se controlan ahora: las de hoy que no se cancelaron y no terminaron hace mas de una hora
function funcionesDeHoy(funciones, cineId, ahora) {
  const limite = ahora - 3600000;
  return funciones
    .filter((f) => String(f.cineId) === cineId && f.estado !== 'CANCELADA' && fechaDeFuncion(f) === hoyISO())
    .filter((f) => new Date(f.fechaHoraFin ?? f.fechaHoraInicio).getTime() >= limite)
    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio));
}

export default function ValidarEntradasPage() {
  const listado = useListado(cargar);
  const [params, setParams] = useSearchParams();
  const [codigo, setCodigo] = useState('');
  const [validando, setValidando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [camara, setCamara] = useState(false);
  const campo = useRef(null);
  // La hora se actualiza cada minuto: decide que funciones se muestran y cual se propone
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const cines = (listado.datos?.cines ?? []).filter((c) => c.activo);
  const cineId = params.get('cine') ?? (cines[0] ? String(cines[0].id) : '');
  const funciones = funcionesDeHoy(listado.datos?.funciones ?? [], cineId, ahora);
  // Por defecto, la funcion en curso o la proxima en empezar
  const porDefecto = funciones.find((f) => new Date(f.fechaHoraFin).getTime() > ahora) ?? funciones[0];
  const funcionId = params.get('funcion') && funciones.some((f) => String(f.id) === params.get('funcion')) ? params.get('funcion') : porDefecto ? String(porDefecto.id) : '';
  const funcion = funciones.find((f) => String(f.id) === funcionId);
  const validadasAca = historial.filter((h) => h.funcionId === funcionId && h.resultado === 'VALIDA').length;

  const validar = useCallback(
    async (texto) => {
      const limpio = texto.trim().toUpperCase();
      if (!limpio || !funcionId) return;
      setValidando(true);
      let item;
      try {
        const r = await validarEntrada(limpio, funcionId);
        item = { ...r, resultado: r.resultado };
      } catch (err) {
        item = { codigo: limpio, resultado: err.status === 404 ? 'NO_EXISTE' : 'ERROR' };
      }
      setHistorial((h) => [{ ...item, funcionId, id: Date.now(), hora: new Date() }, ...h].slice(0, 20));
      setValidando(false);
      setCodigo('');
      campo.current?.focus();
    },
    [funcionId]
  );

  const enviar = (e) => {
    e.preventDefault();
    validar(codigo);
  };

  if (listado.cargando) {
    return (
      <section>
        <h1 className={admin.titulo}>Validar entradas</h1>
        <EsqueletoFilas cantidad={3} alto={60} etiqueta="Cargando funciones" />
      </section>
    );
  }
  if (listado.error) {
    return (
      <section>
        <h1 className={admin.titulo}>Validar entradas</h1>
        <EstadoError titulo="No pudimos cargar las funciones" onReintentar={listado.reintentar} />
      </section>
    );
  }

  const ultimo = historial[0];
  const resultado = ultimo && (RESULTADOS[ultimo.resultado] ?? RESULTADOS.ERROR);

  return (
    <section>
      <title>Validar entradas | Panel | CineClick</title>
      <div className={admin.encabezado}>
        <h1 className={admin.titulo}>Validar entradas</h1>
      </div>

      <div className={styles.seleccion}>
        <label className={styles.campoSeleccion}>
          Cine
          <select className={admin.control} value={cineId} onChange={(e) => setParams({ cine: e.target.value }, { replace: true })}>
            {cines.map((c) => (
              <option key={c.id} value={c.id}>
                {nombreCine(c.nombre)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.campoSeleccion}>
          Función
          <select
            className={admin.control}
            value={funcionId}
            disabled={!funciones.length}
            onChange={(e) => setParams({ cine: cineId, funcion: e.target.value }, { replace: true })}
          >
            {!funciones.length && <option value="">Sin funciones hoy</option>}
            {funciones.map((f) => (
              <option key={f.id} value={f.id}>
                {horaCorta(f.fechaHoraInicio)} · {f.peliculaTitulo} · {f.salaNombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!funciones.length ? (
        <EstadoVacio titulo="No hay funciones para controlar hoy en este cine" mensaje="Elegí otro cine o programá funciones desde la sección Funciones." />
      ) : (
        <div className={styles.columnas}>
          <div className={styles.panelControl}>
            <p className={styles.funcionActual}>
              <strong>{funcion.peliculaTitulo}</strong>
              <span>
                {fechaFuncionCorta(funcion.fechaHoraInicio)} · {funcion.salaNombre}
              </span>
              <span>
                {validadasAca} {validadasAca === 1 ? 'entrada validada' : 'entradas validadas'} en esta sesión
              </span>
            </p>

            <form className={styles.formCodigo} onSubmit={enviar}>
              <label htmlFor="codigo-entrada" className={admin.etiqueta}>
                Código de la entrada
              </label>
              <div className={styles.filaCodigo}>
                <input
                  id="codigo-entrada"
                  ref={campo}
                  className={`${admin.control} ${styles.inputCodigo}`}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  maxLength={20}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}

                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={validando || !codigo.trim()}>
                  {validando ? 'Validando…' : 'Validar'}
                </button>
              </div>
              <p className={admin.ayuda}>Son 8 letras y números, debajo del QR. Un lector de QR conectado como teclado también sirve.</p>
            </form>

            {hayEscaner && (
              <div>
                <button type="button" className="btn" aria-pressed={camara} onClick={() => setCamara((c) => !c)}>
                  {camara ? 'Cerrar la cámara' : 'Escanear con la cámara'}
                </button>
                {camara && <EscanerQr onCodigo={validar} />}
              </div>
            )}
          </div>

          <div className={styles.panelResultado} role="status" aria-live="polite">
            {resultado ? (
              <div className={`${styles.resultado} ${styles[resultado.clase]}`}>
                <p className={styles.resultadoTitulo} data-icono={resultado.icono}>
                  {resultado.titulo}
                </p>
                <p className={styles.resultadoCodigo}>{ultimo.codigo}</p>
                {ultimo.codigoButaca && (
                  <p className={styles.resultadoDetalle}>
                    {ultimo.resultado === 'OTRA_FUNCION'
                      ? `Es para ${ultimo.peliculaTitulo}, ${nombreCine(ultimo.cineNombre)} · ${ultimo.salaNombre}, ${fechaFuncionCorta(ultimo.fechaHoraInicio)}.`
                      : `Butaca ${ultimo.codigoButaca} · ${ultimo.peliculaTitulo}`}
                  </p>
                )}
              </div>
            ) : (
              <p className={styles.esperando}>Ingresá o escaneá un código para ver el resultado.</p>
            )}

            {historial.length > 1 && (
              <>
                <h2 className={styles.historialTitulo}>Últimas validaciones</h2>
                <ul className={styles.historial}>
                  {historial.slice(1).map((h) => (
                    <li key={h.id}>
                      <span className={styles.historialCodigo}>{h.codigo}</span>
                      <span data-icono={h.resultado === 'VALIDA' ? 'ok' : 'error'}>{(RESULTADOS[h.resultado] ?? RESULTADOS.ERROR).titulo}</span>
                      <span className={admin.secundario}>{horaCorta(h.hora.toISOString())}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
