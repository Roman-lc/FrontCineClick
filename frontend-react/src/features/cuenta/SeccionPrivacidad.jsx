import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarCuenta, exportarDatos } from '../../services/cuenta';
import { getComprasDelCliente } from '../../services/compras';
import { useAuth } from '../../app/useAuth';
import { useToast } from '../../components/ui/useToast';
import { horaCorta } from '../../lib/fechas';
import BloqueCuenta from './BloqueCuenta';
import DialogoContrasena from './DialogoContrasena';
import styles from './miCuenta.module.css';

function describirFuncion(funcion) {
  const dia = new Date(funcion.fechaHoraInicio).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric' });
  return `${funcion.peliculaTitulo}, ${dia} ${horaCorta(funcion.fechaHoraInicio)}`;
}

function descargarJson(datos) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'cineclick-mis-datos.json';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SeccionPrivacidad({ cuenta }) {
  const { logout } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const [dialogo, setDialogo] = useState(null);
  const [proximas, setProximas] = useState([]);

  const abrirEliminar = async () => {
    setDialogo('eliminar');
    if (!cuenta.clienteId) return;
    try {
      const compras = await getComprasDelCliente(cuenta.clienteId);
      const ahora = new Date();
      setProximas(compras.filter((c) => c.estado === 'CONFIRMADA' && new Date(c.funcion.fechaHoraInicio) > ahora));
    } catch {
      setProximas([]);
    }
  };

  const descargar = async (contrasena) => {
    descargarJson(await exportarDatos(contrasena));
    setDialogo(null);
    mostrarAviso('Descargamos tus datos en cineclick-mis-datos.json', 'exito');
  };

  const eliminar = async (contrasena) => {
    await eliminarCuenta(contrasena);
    setDialogo(null);
    navigate('/', { replace: true });
    logout();
    mostrarAviso('Tu cuenta fue eliminada', 'exito');
  };

  return (
    <BloqueCuenta id="privacidad" titulo="Privacidad" sinEditar>
      <p className={styles.texto}>
        Podés descargar o eliminar tus datos personales en cualquier momento. Más detalles en la{' '}
        <Link to="/privacidad">política de privacidad</Link>.
      </p>
      <div className={styles.accionesEnLinea}>
        <button type="button" className="btn" onClick={() => setDialogo('descargar')}>
          Descargar mis datos
        </button>
        <button type="button" className="btn btn-danger" onClick={abrirEliminar}>
          Eliminar mi cuenta
        </button>
      </div>

      <DialogoContrasena
        abierto={dialogo === 'descargar'}
        titulo="Descargar mis datos"
        textoConfirmar="Descargar"
        textoProcesando="Preparando…"
        onConfirmar={descargar}
        onCerrar={() => setDialogo(null)}
      >
        <p className={styles.texto}>
          Vas a bajar un archivo JSON con los datos de tu cuenta, tus compras (funciones, entradas, montos y estados) y tus solicitudes
          de soporte y arrepentimiento. No incluye tu contraseña ni los datos de tus tarjetas, salvo la marca y los últimos 4 dígitos.
          Para protegerlos, confirmá tu contraseña.
        </p>
      </DialogoContrasena>

      <DialogoContrasena
        abierto={dialogo === 'eliminar'}
        titulo="Eliminar mi cuenta"
        textoConfirmar="Eliminar mi cuenta"
        textoProcesando="Eliminando…"
        peligro
        onConfirmar={eliminar}
        onCerrar={() => setDialogo(null)}
      >
        <ul className={styles.consecuencias}>
          <li>Borramos tu nombre, apellido, email, teléfono y demás datos personales, y no vas a poder volver a ingresar.</li>
          <li>Tus compras se conservan sin tus datos, como registro de las ventas.</li>
          <li>Si tenés una reserva sin pagar, se cancela y se liberan las butacas.</li>
          <li>No se puede deshacer.</li>
        </ul>
        {proximas.length > 0 && (
          <div className={styles.advertencia} role="note">
            <p data-icono="error">
              Tenés entradas para {proximas.map((c) => describirFuncion(c.funcion)).join('; ')}. Si eliminás la cuenta, las vas a poder usar
              igual con sus códigos: anotalos antes desde <Link to="/mis-compras">Mis compras</Link>, porque después no vas a poder
              ingresar para verlos.
            </p>
          </div>
        )}
      </DialogoContrasena>
    </BloqueCuenta>
  );
}
