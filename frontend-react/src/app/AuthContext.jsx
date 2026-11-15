import { useCallback, useState } from 'react';
import { guardarSesion, leerSesion } from '../lib/sesion';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerSesion);

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

  const actualizarSesion = useCallback((cuenta) => {
    setUser((actual) => {
      if (!actual) return actual;
      const usuario = { ...actual, nombre: cuenta.nombre, apellido: cuenta.apellido, email: cuenta.email };
      guardarSesion(usuario);
      return usuario;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, actualizarSesion, isAdmin: user?.rol === 'ADMIN', isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
