import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cineclick_user';
const TOKEN_KEY = 'cineclick_token';

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
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user]);

  const login = (data) => {
    const userData = {
      nombre: data.nombreCompleto || data.nombre || data.apellido ? `${data.nombre || ''} ${data.apellido || ''}`.trim() : data.email,
      email: data.email || '',
      rol: data.rol || '',
      token: data.token || '',
    };
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    setUser(userData);
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

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
