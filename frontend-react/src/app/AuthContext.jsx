import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cineclick_user';

// La sesion es solo para la interfaz: la API no tiene autenticacion (limitacion conocida).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Sin acceso al storage la sesion dura hasta recargar
    }
  }, [user]);

  // data: LoginResponseDTO
  const login = (data) => {
    setUser({
      usuarioId: data.usuarioId ?? null,
      clienteId: data.clienteId ?? null,
      nombre: data.nombre || data.nombreCompleto || data.email,
      apellido: data.apellido || '',
      email: data.email || '',
      rol: data.rol || '',
    });
  };

  const logout = () => setUser(null);

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
