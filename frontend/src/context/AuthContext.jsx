import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Cargar token desde localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    if (saved) setToken(saved);
    setInitializing(false);
  }, []);

  const login = useCallback((jwtToken) => {
    localStorage.setItem("auth_token", jwtToken);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
