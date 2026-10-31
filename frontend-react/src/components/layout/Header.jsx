import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // En el celular el menu se cierra al elegir una opcion
  const cerrarSiEligioOpcion = (e) => {
    if (e.target.closest('a, button')) setMenuAbierto(false);
  };

  const salir = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav className="navbar" aria-label="Principal">
        <div className="nav-brand">
          <NavLink to="/">CineClick</NavLink>
        </div>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>
        <ul id="menu-principal" className={`nav-menu ${menuAbierto ? 'abierto' : ''}`} onClick={cerrarSiEligioOpcion}>
          <li>
            <NavLink to="/" end>
              Cartelera
            </NavLink>
          </li>
          <li>
            <NavLink to="/cines">Cines</NavLink>
          </li>
          <li>
            <NavLink to="/promociones">Promociones</NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/mis-compras">Mis compras</NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          )}
          {user ? (
            <>
              <li className="nav-usuario">{user.nombre || user.email}</li>
              <li>
                <button type="button" onClick={salir}>
                  Salir
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login">Ingresar</NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
