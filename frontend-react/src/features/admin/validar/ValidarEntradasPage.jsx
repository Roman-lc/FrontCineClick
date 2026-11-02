import { useCallback, useRef, useState } from 'react';
import { useListado } from '../../../components/admin/useListado';
import admin from '../../../components/admin/admin.module.css';
import EstadoError from '../../../components/ui/EstadoError';
import { EsqueletoFilas } from '../../../components/ui/Esqueletos';
import { fechaFuncionCorta, horaCorta } from '../../../lib/fechas';
import { nombreCine } from '../../../lib/formato';
import { adminCines, validarEntrada } from '../../../services/admin';
import EscanerQr from './EscanerQr';
import { AVISO_TIPO, RESUMEN, extraerCodigo, textoResultado } from './codigo';
import styles from './validar.module.css';

// El cine del puesto queda guardado en este dispositivo: el controlador lo elige una sola vez
const CLAVE_CINE = 'cineclick_puesto_cine';
const leerCine = () => {
  try {
    return localStorage.getItem(CLAVE_CINE) ?? '';
  } catch {
    return '';
  }
};
const guardarCine = (id) => {
  try {
    if (id) localStorage.setItem(CLAVE_CINE, id);
    else localStorage.removeItem(CLAVE_CINE);
  } catch {
    // Sin storage, el cine dura hasta recargar
  }
};

// Vibracion corta si el celular la tiene: una para la valida y tres para la rechazada
const vibrar = (ok) => navigator.vibrate?.(ok ? 120 : [70, 60, 70, 60, 70]);

// Control de ingreso: alcanza con el codigo (el backend deduce pelicula, sala, butaca y horario) y el cine del
// puesto. Pensada para usar de pie y rapido: campo con autofocus (sirve un lector de mano que escribe como teclado
// y manda Enter), camara opcional y el resultado grande hasta la proxima lectura o hasta tocar "Siguiente".
export default function ValidarEntradasPage() {
  const cines = useListado(adminCines.listar);
  const [cineId, setCineId] = useState(leerCine);
  const [codigo, setCodigo] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [camara, setCamara] = useState(false);
  const campo = useRef(null);
  const enCurso = useRef(false);

  const activos = (cines.datos ?? []).filter((c) => c.activo);
  const cine = activos.find((c) => String(c.id) === cineId);

  const elegirCine = (id) => {
    guardarCine(id);
    setCineId(id);
    setResultado(null);
  };

  const validar = useCallback(
    async (texto) => {
      const limpio = extraerCodigo(texto);
      if (!limpio || !cineId || enCurso.current) return;
      enCurso.current = true;
      setValidando(true);
      let r;
      try {
        r = await validarEntrada(limpio, cineId);
      } catch (err) {
        r = { codigo: limpio, resultado: err.status === 404 ? 'NO_EXISTE' : 'ERROR' };
      }
      const { ok } = textoResultado(r);
      vibrar(ok);
      setResultado(r);
      setHistorial((h) => [{ ...r, id: `${Date.now()}-${limpio}`, hora: new Date() }, ...h].slice(0, 10));
      setCodigo('');
      setValidando(false);
      enCurso.current = false;
      campo.current?.focus();
    },
    [cineId]
  );

  const enviar = (e) => {
    e.preventDefault();
    validar(codigo);
  };

  const siguiente = () => {
    setResultado(null);
    campo.current?.focus();
  };

  if (cines.cargando) return <EsqueletoFilas cantidad={3} alto={60} etiqueta="Cargando cines" />;
  if (cines.error) return <EstadoError titulo="No pudimos cargar los cines" onReintentar={cines.reintentar} />;

  // Primera vez en este dispositivo (o el cine guardado ya no esta activo): se elige el cine del puesto
  if (!cine) {
    return (
      <section>
        <title>Validar entradas | Panel | CineClick</title>
        <h1 className={admin.titulo}>Validar entradas</h1>
        <h2 className={styles.preguntaCine}>¿En qué cine está este puesto?</h2>
        <p className={admin.ayuda}>Queda guardado en este dispositivo. No hace falta elegir la función: el código alcanza.</p>
        <ul className={styles.listaCines}>
          {activos.map((c) => (
            <li key={c.id}>
              <button type="button" className={styles.botonCine} onClick={() => elegirCine(String(c.id))}>
                {nombreCine(c.nombre)}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const texto = resultado && textoResultado(resultado);
  const conDatos = resultado?.salaNombre;

  return (
    <section className={styles.pantalla}>
      <title>Validar entradas | Panel | CineClick</title>
      <div className={styles.barraPuesto}>
        <h1 className={styles.tituloPantalla}>Validar entradas</h1>
        <p className={styles.puesto}>
          Controlando: <strong>{nombreCine(cine.nombre)}</strong> ·{' '}
          <button type="button" className={styles.cambiar} onClick={() => elegirCine('')}>
            Cambiar
          </button>
        </p>
      </div>

      <form className={styles.formCodigo} onSubmit={enviar}>
        <label htmlFor="codigo-entrada" className="visually-hidden">
          Código de la entrada
        </label>
        <input
          id="codigo-entrada"
          ref={campo}
          className={styles.inputCodigo}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Código de la entrada"
          maxLength={300}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          aria-describedby="ayuda-codigo"
          autoFocus
        />
        <button type="submit" className={`btn btn-primary ${styles.botonGrande}`} disabled={validando || !codigo.trim()}>
          {validando ? 'Validando…' : 'Validar'}
        </button>
        <button type="button" className={`btn ${styles.botonGrande}`} aria-pressed={camara} onClick={() => setCamara((c) => !c)}>
          {camara ? 'Cerrar la cámara' : 'Escanear con la cámara'}
        </button>
      </form>
      <p id="ayuda-codigo" className={admin.ayuda}>
        8 letras y números, debajo del QR. Un lector de QR conectado como teclado escribe el código y lo envía solo.
      </p>

      {camara && <EscanerQr onCodigo={validar} />}

      <div className={styles.zonaResultado} role="status" aria-live="assertive">
        {texto ? (
          <div className={`${styles.resultado} ${texto.ok ? styles.valida : styles.rechazada}`}>
            <p className={styles.resultadoTitulo} data-icono={texto.ok ? 'ok' : 'error'}>
              {texto.titulo}
            </p>
            {resultado.resultado === 'VALIDA' && <p className={styles.sala}>{resultado.salaNombre}</p>}
            {resultado.resultado === 'VALIDA' && AVISO_TIPO[resultado.tipo] && (
              <p className={styles.avisoTipo} data-icono="error">
                {AVISO_TIPO[resultado.tipo]}
              </p>
            )}
            {conDatos && (
              <p className={styles.datosEntrada}>
                Butaca <strong>{resultado.codigoButaca}</strong> · {resultado.peliculaTitulo} · {fechaFuncionCorta(resultado.fechaHoraInicio)}
                {resultado.resultado !== 'VALIDA' && ` · ${resultado.salaNombre}`}
                {resultado.resultado === 'OTRO_CINE' && ` · ${nombreCine(resultado.cineNombre)}`}
              </p>
            )}
            <p className={styles.codigoLeido}>{resultado.codigo}</p>
            <button type="button" className={`btn ${styles.botonGrande}`} onClick={siguiente}>
              Siguiente
            </button>
          </div>
        ) : (
          <p className={styles.esperando}>Escaneá o escribí un código para validar la entrada.</p>
        )}
      </div>

      {historial.length > 0 && (
        <section aria-labelledby="titulo-historial">
          <h2 id="titulo-historial" className={styles.historialTitulo}>
            Últimas validaciones de este puesto
          </h2>
          <div className={admin.tablaCaja}>
            <table className={admin.tabla}>
              <thead>
                <tr>
                  <th scope="col">Hora</th>
                  <th scope="col">Código</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Sala</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id}>
                    <td className={admin.numero}>{horaCorta(h.hora.toISOString())}</td>
                    <td className={admin.codigo}>{h.codigo}</td>
                    <td>
                      <span data-icono={h.resultado === 'VALIDA' ? 'ok' : 'error'}>{RESUMEN[h.resultado] ?? h.resultado}</span>
                    </td>
                    <td>{h.salaNombre ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
