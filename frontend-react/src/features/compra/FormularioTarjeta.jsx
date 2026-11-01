import Ayuda from '../../components/ui/Ayuda';
import {
  formatearNumeroTarjeta,
  formatearVencimiento,
  largoMaximoNumero,
  detectarMarca,
  normalizarVencimiento,
  soloDigitos,
} from '../../lib/tarjeta';
import { IDS_CAMPOS } from './estadoCompra';
import LogoMarca from './LogoMarca';
import styles from './compra.module.css';

// Campos controlados: el componente solo limpia lo que se escribe (sin letras donde van numeros,
// espacios y barra automaticos). Los errores llegan ya filtrados: solo los de campos que se dejaron.
export default function FormularioTarjeta({ valores, errores, marca, onCambiar, onSalir }) {
  const cambiarNumero = (texto) => {
    const digitos = soloDigitos(texto);
    onCambiar('numero', digitos.slice(0, largoMaximoNumero(detectarMarca(digitos))));
  };

  return (
    <div className={styles.camposTarjeta}>
      <Campo id={IDS_CAMPOS.numero} etiqueta="Número de tarjeta" error={errores.numero} className={styles.campoCompleto}>
        <div className={styles.conLogo}>
          <input
            id={IDS_CAMPOS.numero}
            className="form-input"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={formatearNumeroTarjeta(valores.numero)}
            onChange={(e) => cambiarNumero(e.target.value)}
            onBlur={() => onSalir('numero')}
            aria-invalid={Boolean(errores.numero)}
            aria-describedby={errores.numero ? `${IDS_CAMPOS.numero}-error` : undefined}
          />
          <span className={styles.logo}>
            <LogoMarca marca={marca?.id} />
          </span>
        </div>
        <span className="visually-hidden" aria-live="polite">
          {marca ? `Tarjeta ${marca.nombre}` : ''}
        </span>
      </Campo>

      <Campo id={IDS_CAMPOS.vencimiento} etiqueta="Vencimiento" error={errores.vencimiento}>
        <input
          id={IDS_CAMPOS.vencimiento}
          className="form-input"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={formatearVencimiento(valores.vencimiento)}
          onChange={(e) => onCambiar('vencimiento', normalizarVencimiento(e.target.value))}
          onBlur={() => onSalir('vencimiento')}
          aria-invalid={Boolean(errores.vencimiento)}
          aria-describedby={errores.vencimiento ? `${IDS_CAMPOS.vencimiento}-error` : undefined}
        />
      </Campo>

      <Campo
        id={IDS_CAMPOS.codigo}
        etiqueta="Código de seguridad"
        error={errores.codigo}
        ayuda={
          <Ayuda etiqueta="¿Dónde está el código de seguridad?">
            {marca?.id === 'amex'
              ? 'Son los 4 números que están en el frente de la tarjeta, arriba del número.'
              : 'Son los 3 números que están al dorso de la tarjeta, al lado de la firma.'}
          </Ayuda>
        }
      >
        <input
          id={IDS_CAMPOS.codigo}
          className="form-input"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={marca?.id === 'amex' ? '0000' : '000'}
          value={valores.codigo}
          onChange={(e) => onCambiar('codigo', soloDigitos(e.target.value).slice(0, marca?.largoCodigo ?? 4))}
          onBlur={() => onSalir('codigo')}
          aria-invalid={Boolean(errores.codigo)}
          aria-describedby={errores.codigo ? `${IDS_CAMPOS.codigo}-error` : undefined}
        />
      </Campo>

      <Campo id={IDS_CAMPOS.titular} etiqueta="Nombre del titular" error={errores.titular} className={styles.campoCompleto}>
        <input
          id={IDS_CAMPOS.titular}
          className="form-input"
          autoComplete="cc-name"
          placeholder="Como figura en la tarjeta"
          value={valores.titular}
          onChange={(e) => onCambiar('titular', e.target.value)}
          onBlur={() => onSalir('titular')}
          aria-invalid={Boolean(errores.titular)}
          aria-describedby={errores.titular ? `${IDS_CAMPOS.titular}-error` : undefined}
        />
      </Campo>

      <Campo id={IDS_CAMPOS.dni} etiqueta="DNI del titular" error={errores.dni}>
        <input
          id={IDS_CAMPOS.dni}
          className="form-input"
          inputMode="numeric"
          placeholder="Sin puntos"
          value={valores.dni}
          onChange={(e) => onCambiar('dni', soloDigitos(e.target.value).slice(0, 8))}
          onBlur={() => onSalir('dni')}
          aria-invalid={Boolean(errores.dni)}
          aria-describedby={errores.dni ? `${IDS_CAMPOS.dni}-error` : undefined}
        />
      </Campo>
    </div>
  );
}

function Campo({ id, etiqueta, error, ayuda, className = '', children }) {
  return (
    <div className={`${styles.campo} ${className}`}>
      <div className={styles.etiquetaCampo}>
        <label htmlFor={id}>{etiqueta}</label>
        {ayuda}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.errorCampo} data-icono="error">
          {error}
        </p>
      )}
    </div>
  );
}
