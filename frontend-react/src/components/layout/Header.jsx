import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav className="navbar">
        <div className="nav-brand">
          <NavLink to="/">🎬 CineClick</NavLink>
        </div>
        <button className="nav-toggle" id="navToggle" aria-label="Abrir menú" onClick={() => {
          document.getElementById('navMenu')?.classList.toggle('active');
        }}>☰</button>
        <ul className="nav-menu" id="navMenu">
          <li><NavLink to="/">Inicio</NavLink></li>
          <li><NavLink to="/funciones">Funciones</NavLink></li>
          <li><NavLink to="/grupo">Grupo</NavLink></li>
          {isAdmin && <li id="navAdmin"><NavLink to="/admin">Panel Admin</NavLink></li>}
          {!user && <li id="navLogin"><NavLink to="/login">Login</NavLink></li>}
          {user && (
            <li id="navUser" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span id="userName">{user.nombre || user.email}</span> <a href="#" id="btnLogout" onClick={handleLogout}>Salir</a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
