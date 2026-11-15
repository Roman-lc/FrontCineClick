import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmarCambioEmail } from '../../services/cuenta';
import { useAuth } from '../../app/useAuth';
import { useToast } from '../../components/ui/useToast';

export default function ConfirmarEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { actualizarSesion } = useAuth();
  const { mostrarAviso } = useToast();
  const [error, setError] = useState(token ? null : 'invalido');
  const pedido = useRef(false);

  useEffect(() => {
    if (!token || pedido.current) return;
    pedido.current = true;
    confirmarCambioEmail(token)
      .then((cuenta) => {
        actualizarSesion(cuenta);
        mostrarAviso(`Listo, tu email ahora es ${cuenta.email}`, 'exito');
        navigate('/cuenta#email', { replace: true });
      })
      .catch((err) => setError(err.status === 404 ? 'invalido' : err.status === 409 ? 'ocupado' : 'otro'));
  }, [token, actualizarSesion, mostrarAviso, navigate]);

  const mensajes = {
    invalido: ['Este enlace venció o ya se usó', 'Los enlaces duran 30 minutos y solo sirven con la cuenta que pidió el cambio.'],
    ocupado: ['Ese email ya tiene una cuenta', 'Otra cuenta empezó a usarlo mientras tanto. Elegí otro desde Mi cuenta.'],
    otro: ['No pudimos confirmar el cambio', 'Revisá tu conexión y abrí el enlace de nuevo.'],
  };

  return (
    <section className="section acceso">
      <title>Confirmar email | CineClick</title>
      <div className="acceso-tarjeta acceso-tarjeta-izquierda">
        {error ? (
          <div className="acceso-pasos">
            <h1 className="acceso-titulo">{mensajes[error][0]}</h1>
            <p className="form-ayuda">{mensajes[error][1]}</p>
            <Link to="/cuenta#email" className="btn btn-primary btn-bloque">
              Ir a Mi cuenta
            </Link>
          </div>
        ) : (
          <p className="form-ayuda" role="status">
            Confirmando tu nuevo email…
          </p>
        )}
      </div>
    </section>
  );
}
