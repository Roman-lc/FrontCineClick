import { useState, createContext, useContext } from 'react';
import { guardarSesion, leerSesion } from '../lib/sesion';

const AuthContext = createContext(null);

// La sesion es solo para la interfaz: la API no tiene autenticacion con tokens (limitacion conocida).
// Se guarda en el momento del login, antes de que las pantallas siguientes pidan datos con X-Usuario-Id.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerSesion);

  // data: LoginResponseDTO
  const login = (data) => {
    const usuario = {
      usuarioId: data.usuarioId ?? null,
      clienteId: data.clienteId ?? null,
      nombre: data.nombre || data.nombreCompleto || data.email,
      apellido: data.apellido || '',
      email: data.email || '',
      rol: data.rol || '',
    };
    guardarSesion(usuario);
    setUser(usuario);
  };

  const logout = () => {
    guardarSesion(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.rol === 'ADMIN', isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
