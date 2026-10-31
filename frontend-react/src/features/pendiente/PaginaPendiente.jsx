import { Link } from 'react-router-dom';
import EstadoVacio from '../../components/ui/EstadoVacio';

// Provisoria: ocupa las rutas nuevas hasta que se implementen en su etapa del plan.
export default function PaginaPendiente({ titulo, etapa }) {
  return (
    <section className="section">
      <title>{`${titulo} | CineClick`}</title>
      <h1>{titulo}</h1>
      <EstadoVacio mensaje={`Esta sección se implementa en la etapa ${etapa}.`}>
        <Link to="/" className="btn">
          Ir a la cartelera
        </Link>
      </EstadoVacio>
    </section>
  );
}
