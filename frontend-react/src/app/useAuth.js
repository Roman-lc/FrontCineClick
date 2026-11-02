import { createContext, useContext } from 'react';

// Contexto de la sesion (lo provee AuthProvider en AuthContext.jsx)
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
