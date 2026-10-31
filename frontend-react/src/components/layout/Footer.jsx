import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-contenido">
        <p>&copy; 2026 CineClick · TPO Aplicaciones Interactivas</p>
        <Link to="/grupo">Quiénes somos</Link>
      </div>
    </footer>
  );
}
