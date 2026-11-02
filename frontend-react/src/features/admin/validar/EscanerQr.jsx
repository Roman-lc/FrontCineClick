import { useEffect, useRef, useState } from 'react';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import styles from './validar.module.css';

// Lector de QR con la camara trasera. Usa la API nativa BarcodeDetector cuando el navegador la tiene (Chrome y
// Edge en Android, ChromeOS, macOS) y, si no, la misma API de la libreria barcode-detector, que se descarga recien
// aca (con su .wasm servido desde el sitio, no desde un CDN). La camara queda abierta: cada QR nuevo se valida
// solo. La camara solo funciona en HTTPS o en localhost.

async function crearDetector() {
  if ('BarcodeDetector' in window) {
    const formatos = await window.BarcodeDetector.getSupportedFormats().catch(() => []);
    if (formatos.includes('qr_code')) return new window.BarcodeDetector({ formats: ['qr_code'] });
  }
  const { BarcodeDetector, prepareZXingModule } = await import('barcode-detector/ponyfill');
  prepareZXingModule({ overrides: { locateFile: (ruta, prefijo) => (ruta.endsWith('.wasm') ? wasmUrl : prefijo + ruta) } });
  return new BarcodeDetector({ formats: ['qr_code'] });
}

export default function EscanerQr({ onCodigo }) {
  const video = useRef(null);
  const [error, setError] = useState('');
  const ultimo = useRef({ codigo: '', momento: 0 });
  // onCodigo cambia en cada render de la pantalla: se lee de una ref para no reiniciar la camara
  const avisar = useRef(onCodigo);
  useEffect(() => {
    avisar.current = onCodigo;
  }, [onCodigo]);

  useEffect(() => {
    let flujo = null;
    let intervalo = null;
    let activo = true;

    if (!navigator.mediaDevices?.getUserMedia) {
      // Sin HTTPS (o en un navegador viejo) no existe getUserMedia
      Promise.resolve().then(() => setError('La cámara no está disponible en este navegador o sin HTTPS. Ingresá el código a mano.'));
      return undefined;
    }

    Promise.all([navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }), crearDetector()])
      .then(([stream, detector]) => {
        if (!activo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        flujo = stream;
        video.current.srcObject = stream;
        video.current.play().catch(() => {});
        let leyendo = false;
        intervalo = setInterval(async () => {
          if (leyendo || !video.current || video.current.readyState < 2) return;
          leyendo = true;
          const encontrados = await detector.detect(video.current).catch(() => []);
          leyendo = false;
          const codigo = encontrados[0]?.rawValue?.trim();
          if (!codigo) return;
          // El mismo QR frente a la camara no se valida dos veces seguidas
          const ahora = Date.now();
          if (codigo === ultimo.current.codigo && ahora - ultimo.current.momento < 4000) return;
          ultimo.current = { codigo, momento: ahora };
          avisar.current(codigo);
        }, 300);
      })
      .catch((err) => {
        if (!activo) return;
        setError(
          err?.name === 'NotAllowedError'
            ? 'No hay permiso para usar la cámara. Habilitalo en el navegador o ingresá el código a mano.'
            : 'No se pudo usar la cámara. Ingresá el código a mano.'
        );
      });

    return () => {
      activo = false;
      clearInterval(intervalo);
      flujo?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
