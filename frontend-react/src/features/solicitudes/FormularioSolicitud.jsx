import { useEffect, useId, useState } from 'react';
import { useAuth } from '../../app/useAuth';
import { fechaFuncionCorta } from '../../lib/fechas';
import { texto } from '../../lib/normalizar';
import { getComprasDelCliente } from '../../services/compras';
import { buscarCompra } from '../../services/solicitudes';
import TarjetaCompra from './TarjetaCompra';
import styles from './solicitud.module.css';

// Formulario de solicitud reutilizable (arrepentimiento y soporte).
//   campos: [{ nombre, tipo: 'texto' | 'email' | 'codigo' | 'select' | 'textarea' | 'casilla', etiqueta, opcional,
//     opciones: [{ valor, texto }], ayuda, minimo, maximo, autoComplete, vacio (mensaje si falta) }]
//   El campo 'codigo' (numero de compra o codigo de entrada) busca la compra con el 'email' y muestra la tarjeta
//   de confirmacion. requiereCompra: no se puede enviar sin una compra encontrada.
//   detalleCompra(compra): lo que se muestra debajo de la tarjeta (por ejemplo, si es elegible).
//   enviar(valores, compra): promesa con el resultado. exito(resultado): { titulo, numero, mensaje, acciones }.

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Numero de compra o codigo de 8 caracteres de una entrada (mismo alfabeto, sin la O)
const FORMATO_CODIGO = /^(\d{1,12}|[0-9A-NP-Z]{8})$/;

const normalizarCodigo = (valor) => String(valor ?? '').replace(/[\s-]/g, '').toUpperCase();

function errorDe(campo, valor) {
  const vacio = campo.tipo === 'casilla' ? !valor : !String(valor ?? '').trim();
  if (vacio) {
    if (campo.opcional) return '';
    return campo.vacio ?? 'Completá este dato';
  }
  if (campo.tipo === 'email' && !FORMATO_EMAIL.test(valor.trim())) return 'Revisá el email: tiene que ser como nombre@dominio.com';
  if (campo.tipo === 'codigo' && !FORMATO_CODIGO.test(normalizarCodigo(valor))) {
    return 'Es el número de compra (por ejemplo, 1234) o el código de 8 caracteres de una de tus entradas';
  }
  if (campo.tipo === 'textarea') {
    const largo = texto(valor)?.length ?? 0;
    if (campo.minimo && largo < campo.minimo) return `Escribí al menos ${campo.minimo} caracteres (te faltan ${campo.minimo - largo})`;
    if (campo.maximo && largo > campo.maximo) return `Puede tener hasta ${campo.maximo} caracteres`;
  }
  return '';
}

export default function FormularioSolicitud({ campos, valoresIniciales = {}, requiereCompra = false, detalleCompra, enviar, textoEnviar, exito }) {
  const { user } = useAuth();
  const id = useId();
  const idCampo = (nombre) => `${id}-${nombre}`;
  const [valores, setValores] = useState(() => ({
    ...Object.fromEntries(campos.map((c) => [c.nombre, c.tipo === 'casilla' ? false : ''])),
    email: user?.email ?? '',
    ...valoresIniciales,
  }));
  const [tocados, setTocados] = useState(() => new Set());
  const [enviando, setEnviando] = useState(false);
  const [erroresServidor, setErroresServidor] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [resultado, setResultado] = useState(null);
  const [misCompras, setMisCompras] = useState([]);
  const conCodigo = campos.some((c) => c.tipo === 'codigo');

  // Con sesion de cliente: sus compras, para elegir una en vez de tipear el codigo
  useEffect(() => {
    if (!conCodigo || !user?.clienteId) return;
    getComprasDelCliente(user.clienteId)
      .then((compras) => setMisCompras(compras.filter((c) => c.estado === 'CONFIRMADA' && c.funcion)))
      .catch(() => setMisCompras([]));
  }, [conCodigo, user?.clienteId]);

  // Busqueda de la compra cuando el email y el codigo tienen formato valido (con una pequeña espera)
  const email = String(valores.email ?? '').trim().toLowerCase();
  const codigo = normalizarCodigo(valores.codigo);
  const claveBusqueda = conCodigo && FORMATO_EMAIL.test(email) && FORMATO_CODIGO.test(codigo) ? `${email}|${codigo}` : null;
  const [respuesta, setRespuesta] = useState({ clave: null });
  useEffect(() => {
    if (!claveBusqueda) return undefined;
    let ignorar = false;
    const espera = setTimeout(() => {
      buscarCompra(email, codigo)
        .then((compra) => !ignorar && setRespuesta({ clave: claveBusqueda, estado: 'encontrada', compra }))
        .catch((err) => {
          if (ignorar) return;
          const mensaje =
            err.status === 404
              ? 'No encontramos una compra con esos datos. Revisá el email con el que compraste.'
              : err.status === 429
                ? err.message
                : 'No pudimos buscar la compra. Probá de nuevo en unos segundos.';
          setRespuesta({ clave: claveBusqueda, estado: 'no-encontrada', mensaje });
        });
    }, 450);
    return () => {
      ignorar = true;
      clearTimeout(espera);
    };
  }, [claveBusqueda]); // eslint-disable-line react-hooks/exhaustive-deps
  const busqueda = !claveBusqueda ? { estado: 'inactiva' } : respuesta.clave === claveBusqueda ? respuesta : { estado: 'buscando' };

  const erroresDe = (vals) => {
    const errs = {};
    for (const campo of campos) {
      const error = errorDe(campo, vals[campo.nombre]);
      if (error) errs[campo.nombre] = error;
    }
    if (conCodigo && !errs.codigo && (requiereCompra || codigo) && busqueda.estado !== 'encontrada') {
      errs.codigo = busqueda.estado === 'no-encontrada' ? busqueda.mensaje : busqueda.estado === 'buscando' ? 'Esperá un momento: estamos buscando la compra' : errs.codigo;
    }
    return errs;
  };
  const errores = erroresDe(valores);
  const visible = (nombre) => erroresServidor[nombre] || (tocados.has(nombre) ? errores[nombre] : '');

  const cambiar = (campo, valor) => {
    const normalizado = campo.tipo === 'codigo' ? normalizarCodigo(valor) : valor;
    setValores((v) => ({ ...v, [campo.nombre]: normalizado }));
    setErroresServidor((e) => ({ ...e, [campo.nombre]: '' }));
  };

  // Al salir del campo: normalizacion (email en minusculas, espacios de mas) y se muestra su error
  const salir = (campo) => {
    setValores((v) => {
      const valor = v[campo.nombre];
      if (campo.tipo === 'email') return { ...v, email: String(valor).trim().toLowerCase() };
      if (campo.tipo === 'texto' || campo.tipo === 'textarea') return { ...v, [campo.nombre]: texto(valor) ?? '' };
      return v;
    });
    setTocados((t) => new Set(t).add(campo.nombre));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (enviando) return;
    const limpios = Object.fromEntries(
      campos.map((c) => {
        const valor = valores[c.nombre];
        if (c.tipo === 'email') return [c.nombre, String(valor).trim().toLowerCase()];
        if (c.tipo === 'codigo') return [c.nombre, normalizarCodigo(valor)];
        if (c.tipo === 'texto' || c.tipo === 'textarea') return [c.nombre, texto(valor) ?? ''];
        return [c.nombre, valor];
      })
    );
    setValores((v) => ({ ...v, ...limpios }));
    setTocados(new Set(campos.map((c) => c.nombre)));
    const errs = erroresDe(limpios);
    const primero = campos.find((c) => errs[c.nombre]);
    if (primero) {
      requestAnimationFrame(() => document.getElementById(idCampo(primero.nombre))?.focus());
      return;
    }
    setEnviando(true);
    setErrorGeneral('');
    try {
      setResultado(await enviar(limpios, busqueda.compra));
    } catch (err) {
      const porCampo = {};
      for (const detalle of err.detalles ?? []) {
        const [campo, ...resto] = detalle.split(':');
        if (resto.length) porCampo[campo.trim()] = resto.join(':').trim();
      }
      if (err.status === 404) porCampo.codigo = 'No encontramos una compra con esos datos. Revisá el email con el que compraste.';
      setErroresServidor(porCampo);
      if (!Object.keys(porCampo).length) {
        setErrorGeneral(err.status === 429 || err.status === 400 ? err.message : 'No pudimos enviar la solicitud. Probá de nuevo en unos segundos.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (resultado) return <PantallaExito {...exito(resultado)} />;

  return (
    <form className={styles.formulario} onSubmit={enviarFormulario} noValidate>
      <p className={styles.nota}>
        Los datos marcados con <span aria-hidden="true">*</span>
        <span className="visually-hidden">asterisco</span> son obligatorios.
      </p>
      {errorGeneral && (
        <p className={styles.errorGeneral} role="alert" data-icono="error">
          {errorGeneral}
        </p>
      )}

      {campos.map((campo) => {
        const idc = idCampo(campo.nombre);
        const error = visible(campo.nombre);
        const idAyuda = `${idc}-ayuda`;
        const idContador = `${idc}-contador`;
        const describe = [error || campo.ayuda ? idAyuda : null, campo.tipo === 'textarea' && campo.maximo ? idContador : null].filter(Boolean).join(' ') || undefined;
        const comunes = {
          id: idc,
          name: campo.nombre,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describe,
          'aria-required': campo.opcional ? undefined : true,
          onBlur: () => salir(campo),
        };

        if (campo.tipo === 'casilla') {
          return (
            <div key={campo.nombre} className={styles.campo}>
              <label className={styles.casilla}>
                <input type="checkbox" checked={valores[campo.nombre]} onChange={(e) => cambiar(campo, e.target.checked)} {...comunes} />
                <span>
                  {campo.etiqueta}
                  {!campo.opcional && <span aria-hidden="true"> *</span>}
                </span>
              </label>
              {error && (
                <p id={idAyuda} className={styles.error} data-icono="error">
                  {error}
                </p>
              )}
            </div>
          );
        }

        return (
          <div key={campo.nombre} className={styles.campo}>
            {campo.tipo === 'codigo' && misCompras.length > 0 && (
              <div className={styles.misCompras}>
                <label htmlFor={`${idc}-mias`} className={styles.etiqueta}>
                  Elegí una de tus compras
                </label>
                <select
                  id={`${idc}-mias`}
                  className={styles.control}
                  value={misCompras.some((c) => String(c.id) === codigo) ? codigo : ''}
                  onChange={(e) => e.target.value && cambiar(campo, e.target.value)}
                >
                  <option value="">Elegí una compra…</option>
                  {misCompras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.funcion.peliculaTitulo} · {fechaFuncionCorta(c.funcion.fechaHoraInicio)} · Compra N° {c.id}
                    </option>
                  ))}
                </select>
                <p className={styles.separador}>o escribí el número o código</p>
              </div>
            )}
            <label htmlFor={idc} className={styles.etiqueta}>
              {campo.etiqueta}
              {campo.opcional ? <span className={styles.opcional}> (opcional)</span> : <span aria-hidden="true"> *</span>}
            </label>
            {campo.tipo === 'select' ? (
              <select className={styles.control} value={valores[campo.nombre]} onChange={(e) => cambiar(campo, e.target.value)} {...comunes}>
                <option value="">{campo.opcional ? 'Sin especificar' : 'Elegí una opción'}</option>
                {campo.opciones.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.texto}
                  </option>
                ))}
              </select>
            ) : campo.tipo === 'textarea' ? (
              <textarea className={styles.control} rows={6} maxLength={campo.maximo ? campo.maximo + 50 : undefined} value={valores[campo.nombre]} onChange={(e) => cambiar(campo, e.target.value)} {...comunes} />
            ) : (
              <input
                className={`${styles.control} ${campo.tipo === 'codigo' ? styles.controlCodigo : ''}`}
                type={campo.tipo === 'email' ? 'email' : 'text'}
                inputMode={campo.tipo === 'email' ? 'email' : undefined}
                autoComplete={campo.autoComplete ?? (campo.tipo === 'email' ? 'email' : 'off')}
                autoCapitalize={campo.tipo === 'codigo' ? 'characters' : undefined}
                spellCheck={campo.tipo === 'codigo' || campo.tipo === 'email' ? false : undefined}
                value={valores[campo.nombre]}
                onChange={(e) => cambiar(campo, e.target.value)}
                {...comunes}
              />
            )}
            {campo.tipo === 'textarea' && campo.maximo && (
              <p id={idContador} className={styles.contador} aria-live="polite">
                {(texto(valores[campo.nombre])?.length ?? 0)} / {campo.maximo}
              </p>
            )}
            {(error || campo.ayuda) && (
              <p id={idAyuda} className={error ? styles.error : styles.ayuda} data-icono={error ? 'error' : undefined}>
                {error || campo.ayuda}
              </p>
            )}
            {campo.tipo === 'codigo' && (
              <div aria-live="polite">
                {busqueda.estado === 'buscando' && <p className={styles.buscando}>Buscando la compra…</p>}
                {busqueda.estado === 'encontrada' && (
                  <div className={styles.compraEncontrada}>
                    <p className={styles.compraEncontradaTitulo} data-icono="ok">
                      Encontramos esta compra. Verificá que sea la correcta:
                    </p>
                    <TarjetaCompra compra={busqueda.compra} />
                    {detalleCompra?.(busqueda.compra)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="submit" className={`btn btn-primary ${styles.enviar}`} disabled={enviando} aria-busy={enviando}>
        {enviando && <span className={styles.girando} aria-hidden="true" />}
        {enviando ? 'Enviando…' : textoEnviar}
      </button>
    </form>
  );
}

function PantallaExito({ titulo, numero, mensaje, acciones }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(numero);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      const rango = document.createRange();
      rango.selectNodeContents(document.getElementById('numero-solicitud'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(rango);
    }
  };
  return (
    <div className={styles.exito} role="status">
      <span className={styles.tilde} aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 className={styles.exitoTitulo}>{titulo}</h2>
      <p className={styles.exitoEtiqueta}>Tu número de solicitud</p>
      <p className={styles.numeroSolicitud}>
        <span id="numero-solicitud">{numero}</span>
        <button type="button" className="btn btn-sm" onClick={copiar} aria-label={copiado ? 'Número copiado' : 'Copiar el número'}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </p>
      <div className={styles.exitoMensaje}>{mensaje}</div>
      {acciones && <div className={styles.exitoAcciones}>{acciones}</div>}
    </div>
  );
}
