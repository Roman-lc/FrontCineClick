import { useEffect, useRef, useState } from 'react';
import styles from './validar.module.css';

// Lector de QR con la camara usando la API nativa BarcodeDetector (sin librerias). Solo se ofrece si el
// navegador la tiene (ver ValidarEntradasPage); si no, queda el ingreso manual.

export default function EscanerQr({ onCodigo }) {
  const video = useRef(null);
  const [error, setError] = useState('');
  const ultimo = useRef({ codigo: '', momento: 0 });

  useEffect(() => {
    let flujo = null;
    let intervalo = null;
    let activo = true;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (!activo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        flujo = stream;
        video.current.srcObject = stream;
        video.current.play();
        intervalo = setInterval(async () => {
          if (video.current.readyState < 2) return;
          const encontrados = await detector.detect(video.current).catch(() => []);
          const codigo = encontrados[0]?.rawValue?.trim();
          if (!codigo) return;
          // El mismo QR frente a la camara no se valida dos veces seguidas
          const ahora = Date.now();
          if (codigo === ultimo.current.codigo && ahora - ultimo.current.momento < 4000) return;
          ultimo.current = { codigo, momento: ahora };
          onCodigo(codigo);
        }, 350);
      })
      .catch(() => setError('No se pudo usar la cámara. Revisá el permiso del navegador o ingresá el código a mano.'));

    return () => {
      activo = false;
      clearInterval(intervalo);
      flujo?.getTracks().forEach((t) => t.stop());
    };
  }, [onCodigo]);

  return (
    <div className={styles.escaner}>
      {error ? (
        <p className={styles.errorCamara} role="alert" data-icono="error">
          {error}
        </p>
      ) : (
        <video ref={video} className={styles.video} muted playsInline aria-label="Vista de la cámara para leer el QR" />
      )}
    </div>
  );
}
