import { createContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getProfile, setToken, removeToken, getStoredToken } from '../utils/api.js';

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      console.log('[AUTH] Verificando autenticación, token encontrado:', !!token);
      if (token) {
        try {
          const response = await getProfile();
          console.log('[AUTH] Usuario autenticado:', response.user);
          setUser(response.user);
        } catch (error) {
          console.error('[AUTH] Error verificando autenticación:', error);
          removeToken();
        }
      } else {
        console.log('[AUTH] No hay token en localStorage');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await loginAPI(email, password);
      console.log('[AUTH] Login exitoso:', response.user);
      setToken(response.token);
      setUser(response.user);
      console.log('[AUTH] Token guardado en localStorage');
      
      return response;
    } catch (error) {
      console.error('[AUTH] Error en login:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await registerAPI(userData);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
