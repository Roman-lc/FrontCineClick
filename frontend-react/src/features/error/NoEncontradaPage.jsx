import { Link } from 'react-router-dom';
import EstadoVacio from '../../components/ui/EstadoVacio';

export default function NoEncontradaPage() {
  return (
    <section className="section">
      <title>Página no encontrada | CineClick</title>
      <h1>Página no encontrada</h1>
      <EstadoVacio mensaje="La dirección que buscás no existe o cambió.">
        <Link to="/" className="btn btn-primary">
          Volver a la cartelera
        </Link>
      </EstadoVacio>
    </section>
  );
}
